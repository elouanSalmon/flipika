import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Edit, Copy, Download, Check, Loader2, Zap } from 'lucide-react';
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
            // Sanitize filename: allow alphanumeric, accents, and basic separators
            const safeTitle = (report.title || 'Untitled_Report')
                .trim()
                .replace(/[^a-zA-Z0-9àâçéèêëîïôûùüÿñæoe\-_ ]/g, '') // Remove special chars but keep accents
                .replace(/\s+/g, '_'); // Replace spaces with underscores

            const filename = `${safeTitle}_${new Date().toISOString().split('T')[0]}.pdf`;
            console.log('Generating PDF for email:', filename);

            if (!reportPreviewRef.current) {
                throw new Error('Report preview not found');
            }

            await pdfGenerationService.generateReportPDF(
                reportPreviewRef.current,
                {
                    filename,
                    reportTitle: report.title,
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
            // Sanitize filename: allow alphanumeric, accents, and basic separators
            const safeTitle = (report.title || 'Untitled_Report')
                .trim()
                .replace(/[^a-zA-Z0-9àâçéèêëîïôûùüÿñæoe\-_ ]/g, '') // Remove special chars but keep accents
                .replace(/\s+/g, '_'); // Replace spaces with underscores

            const filename = `${safeTitle}_${new Date().toISOString().split('T')[0]}.pdf`;
            console.log('Generating PDF for download:', filename);

            if (!reportPreviewRef.current) {
                throw new Error('Report preview not found');
            }

            await pdfGenerationService.generateReportPDF(
                reportPreviewRef.current,
                {
                    filename,
                    reportTitle: report.title,
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
                <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 shadow-sm transition-all duration-200">
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

                {/* Post-Send Step */}
                {showEmailSent && emailData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                            <div className="flex items-start gap-5 mb-8">
                                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full shadow-sm">
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

                            {/* Download PDF Button */}
                            <button
                                onClick={handleDownloadPDF}
                                className="w-full mb-8 px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-3 font-semibold text-lg"
                            >
                                <Download size={24} />
                                {t('preFlight.actions.downloadPdf')}
                            </button>

                            <div className="space-y-6 bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700/50">
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
                                            className="absolute top-3 right-3 p-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 rounded-md hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-600 transition-all shadow-sm opacity-0 group-hover:opacity-100"
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
                                    className="flex-1 px-6 py-3 border-2 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all font-medium"
                                >
                                    {t('preFlight.actions.back')}
                                </button>
                                <button
                                    onClick={() => setShowEmailSent(false)}
                                    className="flex-1 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all font-medium shadow-lg hover:shadow-xl"
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
            </div>
        </ErrorBoundary>
    );
};

export default ReportPreview;
