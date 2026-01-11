import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Edit, Copy, Download, Check, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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

    const handleSendEmail = async () => {
        if (state.status !== 'success' || !currentUser) return;

        const { report } = state;

        try {
            setPdfGenerating(true);
            setPdfProgress(0);

            // Step 1: Generate PDF first
            if (!reportPreviewRef.current) {
                throw new Error('Report preview not found');
            }

            const filename = `${report.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

            await pdfGenerationService.generateReportPDF(
                reportPreviewRef.current,
                {
                    filename,
                    reportTitle: report.title,
                    startDate: report.startDate,
                    endDate: report.endDate,
                    design: report.design,
                    onProgress: (progress) => {
                        setPdfProgress(progress);
                    }
                }
            );

            toast.success(t('preFlight.pdf.success'));
            setPdfProgress(100);

            // Step 2: Get user profile for email signature
            const profile = await getUserProfile(currentUser.uid);

            // Format dates
            const formatDate = (date?: Date) => {
                if (!date) return 'N/A';
                return new Date(date).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                });
            };

            // Get campaign names
            const campaignNames: string[] = [];
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
                console.warn('Could not load campaign names for email:', err);
            }

            // Step 3: Build email
            const subject = `Rapport Google Ads - ${report.title}`;
            const campaignsText = campaignNames.length
                ? `Campagnes analysées : ${campaignNames.join(', ')}`
                : '';

            const body = `Bonjour,

Je vous partage le rapport d'analyse Google Ads suivant :

Rapport : ${report.title}
Période : ${formatDate(report.startDate)} - ${formatDate(report.endDate)}
${campaignsText}

Vous trouverez le rapport en pièce jointe au format PDF.

N'hésitez pas si vous avez des questions.

Cordialement,
${profile?.firstName || ''} ${profile?.lastName || ''}${profile?.company ? `\n${profile.company}` : ''}`;

            // TODO: Get client email from report/account data
            const clientEmail = report.accountName ? `${report.accountName.toLowerCase().replace(/\s+/g, '.')}@example.com` : 'client@example.com';

            const mailtoLink = `mailto:${clientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

            // Save email data for the post-send step
            setEmailData({ clientEmail, subject, body });

            // Step 4: Open mailto link
            const link = document.createElement('a');
            link.href = mailtoLink;
            link.target = '_self';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // Step 5: Show post-send step
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

            if (!reportPreviewRef.current) {
                throw new Error('Report preview not found');
            }

            const filename = `${report.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.pdf`;

            await pdfGenerationService.generateReportPDF(
                reportPreviewRef.current,
                {
                    filename,
                    reportTitle: report.title,
                    startDate: report.startDate,
                    endDate: report.endDate,
                    design: report.design,
                    onProgress: (progress) => {
                        setPdfProgress(progress);
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
            <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBack}
                                className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Retour"
                            >
                                <ArrowLeft size={20} />
                            </button>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {t('preFlight.title')}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {report.title} • {formatDate(report.startDate)} - {formatDate(report.endDate)}
                                </p>
                            </div>
                        </div>
                        {!showEmailSent && (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleEdit}
                                    className="px-4 py-2 border-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white dark:hover:bg-blue-400 dark:hover:text-gray-900 transition-colors flex items-center gap-2"
                                >
                                    <Edit size={18} />
                                    {t('preFlight.actions.edit')}
                                </button>
                                <button
                                    onClick={handleSendEmail}
                                    disabled={pdfGenerating || !canGenerate}
                                    className="btn btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-full">
                                <Check size={24} className="text-green-600 dark:text-green-400" />
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    {t('preFlight.postSend.title')}
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {t('preFlight.postSend.description')}
                                </p>
                            </div>
                        </div>

                        {/* Download PDF Button */}
                        <button
                            onClick={handleDownloadPDF}
                            className="w-full mb-4 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <Download size={20} />
                            {t('preFlight.actions.downloadPdf')}
                        </button>

                        {/* Client Email */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('preFlight.postSend.recipientLabel')}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={emailData.clientEmail}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                                />
                                <button
                                    onClick={() => handleCopy(emailData.clientEmail, t('preFlight.postSend.recipientLabel'))}
                                    className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <Copy size={18} />
                                    {t('preFlight.actions.copy')}
                                </button>
                            </div>
                        </div>

                        {/* Subject */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('preFlight.postSend.subjectLabel')}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={emailData.subject}
                                    readOnly
                                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                                />
                                <button
                                    onClick={() => handleCopy(emailData.subject, t('preFlight.postSend.subjectLabel'))}
                                    className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                                >
                                    <Copy size={18} />
                                    {t('preFlight.actions.copy')}
                                </button>
                            </div>
                        </div>

                        {/* Email Body */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                {t('preFlight.postSend.bodyLabel')}
                            </label>
                            <div className="flex gap-2">
                                <textarea
                                    value={emailData.body}
                                    readOnly
                                    rows={8}
                                    className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white resize-none font-mono text-sm"
                                />
                                <button
                                    onClick={() => handleCopy(emailData.body, t('preFlight.postSend.bodyLabel'))}
                                    className="px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 self-start"
                                >
                                    <Copy size={18} />
                                    {t('preFlight.actions.copy')}
                                </button>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={handleBack}
                                className="flex-1 px-4 py-2 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                {t('preFlight.actions.back')}
                            </button>
                            <button
                                onClick={() => setShowEmailSent(false)}
                                className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                            >
                                {t('preFlight.actions.viewPreview')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Report Preview - Always rendered but hidden when showEmailSent to keep ref alive for PDF */}
            <main
                className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${showEmailSent ? 'absolute left-[-9999px] top-0' : ''}`}
                aria-hidden={showEmailSent}
            >
                <div ref={reportPreviewRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                    <ReportCanvas
                        slides={slides}
                        design={report.design}
                        startDate={report.startDate}
                        endDate={report.endDate}
                        isPublicView={true}
                        reportId={report.id}
                    />
                </div>
            </main>
        </div>
        </ErrorBoundary>
    );
};

export default ReportPreview;
