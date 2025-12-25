import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Zap, AlertCircle } from 'lucide-react';
import { getPublicReport } from '../services/reportService';
import { getUserProfileByUsername } from '../services/userProfileService';
import ReportCanvas from '../components/reports/ReportCanvas';
import Spinner from '../components/common/Spinner';
import type { EditableReport, WidgetConfig } from '../types/reportTypes';
import type { UserProfile } from '../types/userProfile';
import './PublicReportView.css';

const PublicReportView: React.FC = () => {
    const { username, reportId } = useParams<{ username: string; reportId: string }>();
    const navigate = useNavigate();
    const [report, setReport] = useState<EditableReport | null>(null);
    const [widgets, setWidgets] = useState<WidgetConfig[]>([]);
    const [author, setAuthor] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

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
            setWidgets(result.widgets);
        } catch (err) {
            console.error('Error loading public report:', err);
            setError('Erreur lors du chargement du rapport');
        } finally {
            setLoading(false);
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

    return (
        <div className="public-report-view">
            {/* Header */}
            <header className="public-report-header">
                <div className="public-report-header-content">
                    <div className="public-report-logo" onClick={() => navigate('/')}>
                        <div className="logo-icon">
                            <Zap size={24} />
                        </div>
                        <div className="logo-content">
                            <span className="logo-text gradient-text">Flipika</span>
                            <span className="logo-subtitle">IA</span>
                        </div>
                    </div>

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
            </header>

            {/* Report Content */}
            <main className="public-report-main">
                <ReportCanvas
                    widgets={widgets}
                    design={report.design}
                    startDate={report.startDate}
                    endDate={report.endDate}
                    isPublicView={true}
                />
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
        </div>
    );
};

export default PublicReportView;
