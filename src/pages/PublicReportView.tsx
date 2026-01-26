import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Zap, AlertCircle, Play } from 'lucide-react';
import { getPublicReport } from '../services/reportService';
import { getUserProfileByUsername } from '../services/userProfileService';
import { verifyPassword, storeReportAccess, hasReportAccess } from '../utils/passwordUtils';
import ReportCanvas from '../components/reports/ReportCanvas';
import { TiptapReadOnlyRenderer } from '../components/editor';
import { PresentationOverlay } from '../components/presentation/PresentationOverlay';
import PasswordPrompt from '../components/reports/PasswordPrompt';
import Spinner from '../components/common/Spinner';
import Logo from '../components/Logo';
import type { EditableReport, SlideConfig } from '../types/reportTypes';
import type { UserProfile } from '../types/userProfile';
import type { JSONContent } from '@tiptap/react';
import { useTranslation } from 'react-i18next';
import './PublicReportView.css';

/**
 * Helper to detect if content is Tiptap JSON format
 */
const isTiptapContent = (content: any): content is JSONContent => {
    return content && typeof content === 'object' && content.type === 'doc';
};


const PublicReportView: React.FC = () => {
    const { username, reportId } = useParams<{ username: string; reportId: string }>();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [report, setReport] = useState<EditableReport | null>(null);
    const [slides, setWidgets] = useState<SlideConfig[]>([]);
    const [author, setAuthor] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [needsPassword, setNeedsPassword] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const [showPresentationMode, setShowPresentationMode] = useState(false);

    useEffect(() => {
        loadPublicReport();
    }, [username, reportId]);

    const loadPublicReport = async () => {
        if (!username || !reportId) {
            setError('Lien invalide');
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Get user profile
            const profile = await getUserProfileByUsername(username);
            if (!profile) {
                setError('Utilisateur introuvable');
                setLoading(false);
                return;
            }
            setAuthor(profile);

            // Get public report
            const result = await getPublicReport(reportId);
            if (!result) {
                setError('Rapport introuvable ou non publié');
                setLoading(false);
                return;
            }

            setReport(result.report);

            // Check if password protected
            if (result.report.isPasswordProtected) {
                // Check if user already has access in session
                if (hasReportAccess(reportId)) {
                    setHasAccess(true);
                    setWidgets(result.slides);
                } else {
                    setNeedsPassword(true);
                }
            } else {
                // No password needed
                setHasAccess(true);
                setWidgets(result.slides);
            }
        } catch (err) {
            console.error('Error loading public report:', error);
            setError('Erreur lors du chargement du rapport');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (password: string): Promise<boolean> => {
        if (!report || !reportId) return false;

        try {
            const isValid = await verifyPassword(password, report.passwordHash || '');

            if (isValid) {
                // Store access in session
                storeReportAccess(reportId);
                setHasAccess(true);
                setNeedsPassword(false);

                // Load slides
                const result = await getPublicReport(reportId);
                if (result) {
                    setWidgets(result.slides);
                }
            }

            return isValid;
        } catch (err) {
            console.error('Error verifying password:', err);
            return false;
        }
    };

    if (loading) {
        return (
            <div className="public-report-loading">
                <Spinner />
                <p>Chargement du rapport...</p>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="public-report-error">
                <AlertCircle size={48} />
                <h1>Rapport non disponible</h1>
                <p>{error || 'Ce rapport n\'existe pas ou n\'est pas publié.'}</p>
                <button onClick={() => navigate('/')} className="btn btn-primary">
                    Retour à l'accueil
                </button>
            </div>
        );
    }

    // Show password prompt if needed
    if (needsPassword && !hasAccess) {
        return (
            <PasswordPrompt
                onSubmit={handlePasswordSubmit}
                reportTitle={report.title}
            />
        );
    }

    // Don't show report content until access is granted
    if (!hasAccess) {
        return (
            <div className="public-report-loading">
                <Spinner />
                <p>Chargement du rapport...</p>
            </div>
        );
    }

    return (
        <div className="public-report-view">
            {/* Header */}
            <header className="public-report-header">
                <div className="public-report-header-content">
                    <div className="flex items-center gap-4">
                        <Logo className="origin-left" />

                        {author && (
                            <div className="public-report-author">
                                <span className="author-label">Par</span>
                                <span className="author-name">
                                    {author.firstName} {author.lastName}
                                </span>
                                {author.company && (
                                    <span className="author-company">• {author.company}</span>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Presentation Mode Button */}
                        <button
                            onClick={() => setShowPresentationMode(true)}
                            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            title={t('reports:header.present')}
                        >
                            <Play size={16} className="fill-current" />
                            <span className="hidden sm:inline">{t('reports:header.present')}</span>
                        </button>
                    </div>
                </div>
            </header>

            {/* Report Content */}
            <main className="public-report-main">
                {isTiptapContent(report.content) ? (
                    <TiptapReadOnlyRenderer
                        content={report.content}
                        design={report.design}
                        accountId={report.accountId}
                        campaignIds={report.campaignIds}
                        reportId={report.id}
                        clientId={report.clientId}
                        userId={report.userId}
                        startDate={report.startDate}
                        endDate={report.endDate}
                    />
                ) : (
                    <ReportCanvas
                        slides={slides}
                        design={report.design}
                        startDate={report.startDate}
                        endDate={report.endDate}
                        isPublicView={true}
                        reportId={report.id}
                    />
                )}
            </main>

            {/* Footer */}
            <footer className="public-report-footer">
                <p>
                    Créé avec{' '}
                    <span className="footer-logo" onClick={() => navigate('/')}>
                        <Zap size={16} />
                        <strong>Flipika</strong>
                    </span>
                </p>
            </footer>

            {/* Presentation Mode Overlay */}
            {showPresentationMode && report && (
                <PresentationOverlay
                    report={report}
                    onClose={() => setShowPresentationMode(false)}
                />
            )}
        </div>
    );
};

export default PublicReportView;
