import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Edit, Copy, Download, Check, Loader2, Zap, HelpCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { getReportWithSlides } from '../services/reportService';
import { getUserProfile } from '../services/userProfileService';
import { fetchCampaigns } from '../services/googleAds';
import pdfGenerationService from '../services/pdfGenerationService';
import { useAuth } from '../contexts/AuthContext';
import ReportCanvas from '../components/reports/ReportCanvas';
import Spinner from '../components/common/Spinner';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import ErrorBoundary from '../components/common/ErrorBoundary';
import toast from 'react-hot-toast';
import { parseApiError, API_TIMEOUT_MS, MAX_RETRY_ATTEMPTS } from '../types/errors';
import type { ApiError } from '../types/errors';
import type { EditableReport, SlideConfig } from '../types/reportTypes';
import type { Campaign } from '../types/business';
import { EMAIL_PRESET_KEYS, getFullKey } from '../constants/emailDefaults';
import TroubleshootModal from '../components/reports/TroubleshootModal';
import '../components/Header.css';

type PreviewState =
    | { status: 'loading' }
    | { status: 'success'; report: EditableReport; slides: SlideConfig[] }
    | { status: 'error'; error: ApiError }
    | { status: 'empty'; report: EditableReport };

const ReportPreview: React.FC = () => {
    const { reportId } = useParams<{ reportId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation('reports');
    const { currentUser } = useAuth();
    const [state, setState] = useState<PreviewState>({ status: 'loading' });
    const [showEmailSent, setShowEmailSent] = useState(false);
    const [emailData, setEmailData] = useState<{ clientEmail: string; subject: string; body: string } | null>(null);
    const [pdfGenerating, setPdfGenerating] = useState(false);
    const [pdfProgress, setPdfProgress] = useState(0);
    const [retryCount, setRetryCount] = useState(0);
    const [isRetrying, setIsRetrying] = useState(false);
    const [showTroubleshoot, setShowTroubleshoot] = useState(false);
    const reportPreviewRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (reportId) {
            loadReport();
        }
    }, [reportId]);

    const loadReport = async () => {
        if (!reportId) return;

        setState({ status: 'loading' });

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT_MS);

        try {
            const result = await getReportWithSlides(reportId);

            clearTimeout(timeoutId);

            if (!result) {
                setState({
                    status: 'error',
                    error: parseApiError(new Error('Report not found')),
                });
                return;
            }

            // Check for empty slides (no data state)
            if (!result.slides || result.slides.length === 0) {
                setState({
                    status: 'empty',
                    report: result.report,
                });
                return;
            }

            setState({
                status: 'success',
                report: result.report,
                slides: result.slides
            });

            // Reset retry count on success
            setRetryCount(0);
        } catch (error: unknown) {
            clearTimeout(timeoutId);

            // Parse the error into a structured format
            const apiError = parseApiError(error);

            console.error('Error loading report:', apiError);

            setState({
                status: 'error',
                error: apiError,
            });
        }
    };

    const handleRetry = async () => {
        if (retryCount >= MAX_RETRY_ATTEMPTS) return;

        setIsRetrying(true);
        setRetryCount(prev => prev + 1);

        // Wait with exponential backoff before retrying
        const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
        await new Promise(resolve => setTimeout(resolve, delay));

        await loadReport();
        setIsRetrying(false);
    };

    const fetchReportContext = async (report: EditableReport) => {
        let profile = null;
        let clientData = null;
        const campaignNames: string[] = [];

        // Fetch User Profile
        if (currentUser?.uid) {
            try {
                profile = await getUserProfile(currentUser.uid);
            } catch (err) {
                console.warn('Could not load user profile:', err);
            }
        }

        // Fetch Client Data
        if (report.clientId && currentUser?.uid) {
            try {
                const { getClient } = await import('../services/clientService');
                clientData = await getClient(currentUser.uid, report.clientId);
            } catch (err) {
                console.warn('Could not load client data:', err);
            }
        }

        // Fetch Campaign Names
        try {
            const response = await fetchCampaigns(report.accountId);
            if (response.success && response.campaigns) {
                const campaigns = Array.isArray(response.campaigns) ? response.campaigns : [];
                report.campaignIds.forEach(id => {
                    const campaign = campaigns.find((c: Campaign) => c.id === id);
                    if (campaign) {
                        campaignNames.push(campaign.name);
                    }
                });
            }
        } catch (err) {
            console.warn('Could not load campaign names:', err);
        }

        return { profile, clientData, campaignNames };
    };

    const handleSendEmail = async () => {
        if (state.status !== 'success' || !currentUser) return;

        const { report } = state;

        try {
            setPdfGenerating(true);
            setPdfProgress(0);

            // Step 1: Fetch Context Data
            const { profile, clientData, campaignNames } = await fetchReportContext(report);

            // Step 2: Generate PDF
            // Build a simple, predictable filename: Rapport_[ClientName]_YYYY-MM-DD.pdf
            const dateStr = new Date().toISOString().split('T')[0];
            const clientName = clientData?.name
                ? clientData.name
                    .trim()
                    .replace(/[^a-zA-Z0-9àâçéèêëîïôûùüÿñæoeÀÂÇÉÈÊËÎÏÔÛÙÜŸÑÆŒ\s]/g, '')
                    .replace(/\s+/g, '_')
                    .substring(0, 50)
                : '';

            const filename = clientName
                ? `Rapport_${clientName}_${dateStr}.pdf`
                : `Rapport_${dateStr}.pdf`;

            console.log('Generating PDF for email:', filename);

            // For PDF cover page title: use report title if valid, else client name, else generic
            const isValidTitle = report.title &&
                !report.title.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) &&
                report.title.trim().length > 0;
            const pdfTitle = isValidTitle
                ? report.title.trim().substring(0, 100)
                : (clientData?.name ? `Rapport ${clientData.name}` : 'Rapport de Performance');

            if (!reportPreviewRef.current) {
                throw new Error('Report preview not found');
            }

            await pdfGenerationService.generateReportPDF(
                reportPreviewRef.current,
                {
                    filename,
                    reportTitle: pdfTitle,
                    startDate: report.startDate,
                    endDate: report.endDate,
                    design: report.design,
                    client: clientData || undefined,
                    user: profile || undefined,
                    onProgress: (progress) => {
                        setPdfProgress(progress);
                    },
                    translations: {
                        title: t('preFlight.pdf.overlay.title'),
                        preparing: t('preFlight.pdf.overlay.preparing'),
                        creatingDocument: t('preFlight.pdf.overlay.creatingDocument'),
                        coverPage: t('preFlight.pdf.overlay.coverPage'),
                        slideProgress: t('preFlight.pdf.overlay.slideProgress'),
                        finalizing: t('preFlight.pdf.overlay.finalizing'),
                        saving: t('preFlight.pdf.overlay.saving'),
                        complete: t('preFlight.pdf.overlay.complete'),
                        pleaseWait: t('preFlight.pdf.overlay.pleaseWait'),
                        generatedOn: t('preFlight.pdf.overlay.generatedOn'),
                    }
                }
            );

            toast.success(t('preFlight.pdf.success'));
            setPdfProgress(100);

            // Step 3: Format email content
            const formatDate = (date?: Date) => {
                if (!date) return 'N/A';
                return new Date(date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            };

            // Step 4: Resolve Email Content
            const { resolveEmailVariables } = await import('../utils/emailResolver');

            // Default configuration from locales or hardcoded fallback
            const defaultSubject = t(getFullKey(EMAIL_PRESET_KEYS.SUBJECT_DEFAULT));
            const defaultBody = t(getFullKey(EMAIL_PRESET_KEYS.BODY_DEFAULT));

            const rawSubject = clientData?.emailPreset?.subject || defaultSubject;
            const rawBody = clientData?.emailPreset?.body || defaultBody;

            // Prepare context for variable resolution
            const emailContext = {
                client: clientData || { name: report.accountName || 'Client' } as any,
                period: `${formatDate(report.startDate)} - ${formatDate(report.endDate)}`,
                campaigns: campaignNames.length ? campaignNames.join(', ') : 'Toutes les campagnes',
                userName: profile ? `${profile.firstName} ${profile.lastName}`.trim() : currentUser.displayName || 'User',
                companyName: profile?.company || ''
            };

            const subject = resolveEmailVariables(rawSubject, emailContext);
            const body = resolveEmailVariables(rawBody, emailContext);

            // Use client email if available, otherwise generate a placeholder or use default
            const clientEmail = clientData?.email || (report.accountName ? `${report.accountName.toLowerCase().replace(/\s+/g, '.')}@example.com` : 'client@example.com');

            const mailtoLink = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            // Save email data for the post-send step
            setEmailData({ clientEmail, subject, body });

            // Step 5: Open mailto link
            const link = document.createElement('a');
            link.href = mailtoLink;
            link.target = '_self';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Step 6: Show post-send step
            setShowEmailSent(true);
            toast.success(t('preFlight.postSend.emailOpened'));
        } catch (error) {
            console.error('Error in send email flow:', error);
            toast.error(error instanceof Error ? error.message : t('preFlight.pdf.error'));
        } finally {
            setPdfGenerating(false);
        }
    };

    const handleBack = () => {
        navigate('/app/reports');
    };

    const handleEdit = () => {
        if (state.status === 'success') {
            navigate(`/app/reports/${state.report.id}`);
        }
    };

    const handleCopy = async (text: string, label: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success(t('preFlight.postSend.copied', { label }));
        } catch {
            toast.error(t('preFlight.postSend.copyError'));
        }
    };

    const handleDownloadPDF = async () => {
        if (state.status !== 'success') return;

        const { report } = state;

        try {
            setPdfGenerating(true);
            setPdfProgress(0);

            // Step 1: Fetch Context Data
            const { profile, clientData } = await fetchReportContext(report);

            // Step 2: Generate PDF
            // Build a simple, predictable filename: Rapport_[ClientName]_YYYY-MM-DD.pdf
            const dateStr = new Date().toISOString().split('T')[0];
            const clientName = clientData?.name
                ? clientData.name
                    .trim()
                    .replace(/[^a-zA-Z0-9àâçéèêëîïôûùüÿñæoeÀÂÇÉÈÊËÎÏÔÛÙÜŸÑÆŒ\s]/g, '')
                    .replace(/\s+/g, '_')
                    .substring(0, 50)
                : '';

            const filename = clientName
                ? `Rapport_${clientName}_${dateStr}.pdf`
                : `Rapport_${dateStr}.pdf`;

            console.log('Generating PDF for download:', filename);

            // For PDF cover page title: use report title if valid, else client name, else generic
            const isValidTitle = report.title &&
                !report.title.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i) &&
                report.title.trim().length > 0;
            const pdfTitle = isValidTitle
                ? report.title.trim().substring(0, 100)
                : (clientData?.name ? `Rapport ${clientData.name}` : 'Rapport de Performance');

            if (!reportPreviewRef.current) {
                throw new Error('Report preview not found');
            }

            await pdfGenerationService.generateReportPDF(
                reportPreviewRef.current,
                {
                    filename,
                    reportTitle: pdfTitle,
                    startDate: report.startDate,
                    endDate: report.endDate,
                    design: report.design,
                    client: clientData || undefined,
                    user: profile || undefined,
                    onProgress: (progress) => {
                        setPdfProgress(progress);
                    },
                    translations: {
                        title: t('preFlight.pdf.overlay.title'),
                        preparing: t('preFlight.pdf.overlay.preparing'),
                        creatingDocument: t('preFlight.pdf.overlay.creatingDocument'),
                        coverPage: t('preFlight.pdf.overlay.coverPage'),
                        slideProgress: t('preFlight.pdf.overlay.slideProgress'),
                        finalizing: t('preFlight.pdf.overlay.finalizing'),
                        saving: t('preFlight.pdf.overlay.saving'),
                        complete: t('preFlight.pdf.overlay.complete'),
                        pleaseWait: t('preFlight.pdf.overlay.pleaseWait'),
                        generatedOn: t('preFlight.pdf.overlay.generatedOn'),
                    }
                }
            );

            toast.success(t('preFlight.pdf.success'));
        } catch (error) {
            console.error('Error generating PDF:', error);
            toast.error(error instanceof Error ? error.message : t('preFlight.pdf.error'));
        } finally {
            setPdfGenerating(false);
            setPdfProgress(0);
        }
    };

    const formatDate = (date?: Date): string => {
        if (!date) return 'N/A';
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }).format(date);
    };

    if (state.status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Spinner />
                <p className="mt-4 text-gray-600 dark:text-gray-400">
                    {t('preFlight.loading.title')}
                </p>
            </div>
        );
    }

    if (state.status === 'error') {
        const { error } = state;

        // Get translated error message based on error code
        const errorMessage = t(`preFlight.error.types.${error.code}.message`, { defaultValue: error.userMessage });
        const errorSuggestion = t(`preFlight.error.types.${error.code}.suggestion`, { defaultValue: error.suggestion });

        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="max-w-lg w-full">
                    <ErrorState
                        title={t('preFlight.error.title')}
                        message={errorMessage}
                        suggestion={errorSuggestion}
                        technicalDetails={error.technicalDetails}
                        errorCode={error.code}
                        onRetry={error.retryable ? handleRetry : undefined}
                        retryCount={retryCount}
                        maxRetries={MAX_RETRY_ATTEMPTS}
                        isRetrying={isRetrying}
                        translations={{
                            retry: t('preFlight.error.retry'),
                            retrying: t('preFlight.error.retrying'),
                            attemptCount: t('preFlight.error.attemptCount', { count: retryCount, max: MAX_RETRY_ATTEMPTS }),
                            maxAttempts: t('preFlight.error.maxAttempts'),
                            technicalDetails: t('preFlight.error.technicalDetails'),
                        }}
                    />

                    <div className="mt-6 flex justify-center">
                        <button
                            onClick={handleBack}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            {t('preFlight.actions.back')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (state.status === 'empty') {
        const { report } = state;

        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-4">
                <div className="max-w-lg w-full">
                    <EmptyState
                        title={t('preFlight.emptyState.title')}
                        message={t('preFlight.emptyState.message')}
                        suggestion={t('preFlight.emptyState.suggestion')}
                        variant="warning"
                        action={{
                            label: t('preFlight.emptyState.editReport'),
                            onClick: () => navigate(`/app/reports/${report.id}`),
                        }}
                        secondaryAction={{
                            label: t('preFlight.emptyState.backToReports'),
                            onClick: handleBack,
                        }}
                    />
                </div>
            </div>
        );
    }

    const { report, slides } = state;

    // Check if generation buttons should be disabled
    const canGenerate = slides.length > 0;

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                {/* Header */}
                <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={handleBack}
                                    className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-2"
                                    title="Retour"
                                >
                                    <ArrowLeft size={24} />
                                </button>

                                {/* Logo Wrapper */}
                                <motion.div
                                    className="logo"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                    onClick={() => navigate('/app/reports')}
                                >
                                    <div className="logo-icon">
                                        <Zap size={24} />
                                    </div>
                                    <div className="logo-content">
                                        <span className="logo-text gradient-text">Flipika</span>
                                        <span className="logo-subtitle">IA</span>
                                    </div>
                                </motion.div>

                                {/* Divider */}
                                <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 mx-2 hidden sm:block"></div>

                                <div className="hidden sm:block">
                                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                                        {report.title}
                                    </h1>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                        {formatDate(report.startDate)} - {formatDate(report.endDate)}
                                    </p>
                                </div>
                            </div>

                            {!showEmailSent && (
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={handleEdit}
                                        className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-sm font-medium"
                                    >
                                        <Edit size={16} />
                                        <span className="hidden sm:inline">{t('preFlight.actions.edit')}</span>
                                    </button>
                                    <button
                                        onClick={() => setShowTroubleshoot(true)}
                                        className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                        title={t('preFlight.postSend.troubleshoot.button')}
                                    >
                                        <HelpCircle size={20} />
                                    </button>
                                    <button
                                        onClick={handleSendEmail}
                                        disabled={pdfGenerating || !canGenerate}
                                        className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                                        title={!canGenerate ? 'Ajoutez des slides pour générer le rapport' : undefined}
                                    >
                                        {pdfGenerating ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                {t('preFlight.pdf.progress', { progress: Math.round(pdfProgress) })}
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                {t('preFlight.actions.send')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </header>

                {/* Initial Guidance Banner - Refined Glassmorphism */}
                {!showEmailSent && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6"
                    >
                        <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-md border border-white/20 dark:border-gray-700/50 rounded-2xl p-6 shadow-xl flex items-center justify-between gap-6 transition-all group hover:bg-white/50 dark:hover:bg-gray-800/50">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-500/10 dark:bg-blue-500/20 rounded-2xl border border-blue-500/20 group-hover:scale-110 transition-transform">
                                    <Check size={24} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{t('preFlight.reassurance.title')}</h4>
                                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl text-sm leading-relaxed">{t('preFlight.reassurance.description')}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Post-Send Step */}
                {showEmailSent && emailData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                    >
                        <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20 dark:border-gray-700/50">
                            {/* Stepper integrated in success card */}
                            <div className="flex items-center gap-2 mb-10 px-4 py-2 bg-green-500/10 dark:bg-green-500/20 rounded-full border border-green-500/20 w-fit mx-auto">
                                <div className="flex items-center gap-1.5 opacity-50">
                                    <div className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] font-bold">
                                        <Check size={10} strokeWidth={3} />
                                    </div>
                                    <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">{t('preFlight.steps.preview')}</span>
                                </div>
                                <div className="w-8 h-px bg-green-200 dark:bg-green-800 mx-1"></div>
                                <div className="flex items-center gap-1.5">
                                    <div className="w-5 h-5 rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] font-bold">2</div>
                                    <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">{t('preFlight.steps.send')}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-5 mb-8">
                                <div className="p-3 bg-green-500/10 dark:bg-green-500/20 rounded-2xl border border-green-500/20 shadow-sm">
                                    <Check size={32} className="text-green-600 dark:text-green-400" />
                                </div>
                                <div className="flex-1">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        {t('preFlight.postSend.title')}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                                        {t('preFlight.postSend.description')}
                                    </p>
                                </div>
                            </div>

                            {/* New Instructions Section */}
                            <div className="mb-10">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 text-xs">?</span>
                                    {t('preFlight.postSend.instructions.title')}
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {[1, 2, 3].map((step) => (
                                        <div key={step} className="p-4 rounded-2xl bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm border border-white/20 dark:border-gray-700/50 shadow-sm relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="text-4xl font-black text-blue-500/10 absolute -right-2 -bottom-2 group-hover:scale-110 transition-transform">{step}</div>
                                            <h4 className="font-bold text-gray-900 dark:text-white mb-1 text-sm">
                                                {t(`preFlight.postSend.instructions.step${step}.title`)}
                                            </h4>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                {t(`preFlight.postSend.instructions.step${step}.description`)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Troubleshooting Integrated Section */}
                            <div className="bg-white/30 dark:bg-gray-900/40 backdrop-blur-md rounded-2xl border border-white/20 dark:border-gray-700/50 p-6 space-y-8">
                                <div className="flex items-center justify-between border-b border-white/10 dark:border-gray-700/30 pb-4 mb-2">
                                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        {t('preFlight.postSend.troubleshoot.fallback')}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => {
                                                const reportData = (state as any).report;
                                                if (reportData?.clientId) {
                                                    navigate(`/app/clients/${reportData.clientId}`);
                                                }
                                            }}
                                            className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 whitespace-nowrap"
                                        >
                                            <Edit size={14} />
                                            {t('preFlight.postSend.troubleshoot.editEmail')}
                                        </button>
                                        <button
                                            onClick={() => setShowTroubleshoot(true)}
                                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 dark:bg-blue-500/20 rounded-lg border border-blue-500/20 whitespace-nowrap min-w-fit"
                                        >
                                            <HelpCircle size={14} />
                                            {t('preFlight.postSend.troubleshoot.button')}
                                        </button>
                                    </div>
                                </div>

                                {/* Download PDF Button as a fallback/secondary action */}
                                <div className="space-y-4">
                                    <button
                                        onClick={handleDownloadPDF}
                                        className="w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 hover:bg-white/80 dark:hover:bg-gray-700/80 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 rounded-xl transition-all flex items-center justify-center gap-3 text-sm font-bold shadow-sm"
                                    >
                                        <Download size={18} />
                                        {t('preFlight.actions.downloadPdf')}
                                    </button>
                                </div>

                                {/* Client Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                        {t('preFlight.postSend.recipientLabel')}
                                    </label>
                                    <div className="flex gap-2 group">
                                        <input
                                            type="text"
                                            value={emailData.clientEmail}
                                            readOnly
                                            className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                        <button
                                            onClick={() => handleCopy(emailData.clientEmail, t('preFlight.postSend.recipientLabel'))}
                                            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center gap-2 shadow-sm"
                                        >
                                            <Copy size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Subject */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                        {t('preFlight.postSend.subjectLabel')}
                                    </label>
                                    <div className="flex gap-2 group">
                                        <input
                                            type="text"
                                            value={emailData.subject}
                                            readOnly
                                            className="flex-1 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                        <button
                                            onClick={() => handleCopy(emailData.subject, t('preFlight.postSend.subjectLabel'))}
                                            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all flex items-center gap-2 shadow-sm"
                                        >
                                            <Copy size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Email Body */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                                        {t('preFlight.postSend.bodyLabel')}
                                    </label>
                                    <div className="relative group">
                                        <textarea
                                            value={emailData.body}
                                            readOnly
                                            rows={8}
                                            className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white resize-none font-mono text-sm leading-relaxed focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                        />
                                        <button
                                            onClick={() => handleCopy(emailData.body, t('preFlight.postSend.bodyLabel'))}
                                            className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-700 border border-2 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-md hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm opacity-0 group-hover:opacity-100"
                                            title={t('preFlight.actions.copy')}
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-4 mt-8">
                                <button
                                    onClick={handleBack}
                                    className="btn btn-secondary flex-1"
                                >
                                    {t('preFlight.actions.back')}
                                </button>
                                <button
                                    onClick={() => setShowEmailSent(false)}
                                    className="btn btn-primary flex-1"
                                >
                                    {t('preFlight.actions.viewPreview')}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Report Preview - Always rendered but hidden when showEmailSent to keep ref alive for PDF */}
                <main
                    className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-all duration-300 ${showEmailSent ? 'absolute left-[-9999px] top-0 opacity-0' : 'opacity-100'
                        }`}
                    aria-hidden={showEmailSent}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        ref={reportPreviewRef}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700/50"
                    >
                        <ReportCanvas
                            slides={slides}
                            design={report.design}
                            startDate={report.startDate}
                            endDate={report.endDate}
                            isPublicView={true}
                            reportId={report.id}
                        />
                    </motion.div>
                </main>
                {/* Troubleshoot Modal */}
                <TroubleshootModal
                    isOpen={showTroubleshoot}
                    onClose={() => setShowTroubleshoot(false)}
                />
            </div>
        </ErrorBoundary >
    );
};

export default ReportPreview;
