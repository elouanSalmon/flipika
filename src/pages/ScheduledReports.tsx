import React, { useState, useEffect } from 'react';
import { Plus, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAds } from '../contexts/GoogleAdsContext';
import type { ScheduledReport } from '../types/scheduledReportTypes';
import type { ReportTemplate } from '../types/templateTypes';
import {
    listUserScheduledReports,
    createScheduledReport,
    updateScheduledReport,
    deleteScheduledReport,
    toggleScheduleStatus,
} from '../services/scheduledReportService';
import { listUserTemplates } from '../services/templateService';
import { fetchAccessibleCustomers } from '../services/googleAds';
import ScheduleCard from '../components/schedules/ScheduleCard';
import FeatureAccessGuard from '../components/common/FeatureAccessGuard';
import ScheduleConfigModal, { type ScheduleFormData } from '../components/schedules/ScheduleConfigModal';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/common/ConfirmationModal';
import './ScheduledReports.css';

interface GoogleAdsAccount {
    id: string;
    name: string;
}

const ScheduledReports: React.FC = () => {
    const { currentUser } = useAuth();
    const { isConnected: isGoogleAdsConnected } = useGoogleAds();
    const [schedules, setSchedules] = useState<ScheduledReport[]>([]);
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [googleAuthError, setGoogleAuthError] = useState(false);
    const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ScheduledReport | undefined>();
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [scheduleToDelete, setScheduleToDelete] = useState<ScheduledReport | null>(null);

    useEffect(() => {
        if (currentUser) {
            loadData();
        }
    }, [currentUser, isGoogleAdsConnected]);

    const loadData = async () => {
        if (!currentUser) return;

        setLoading(true);
        setGoogleAuthError(false);
        try {
            // Load essential data first
            const [schedulesData, templatesData] = await Promise.all([
                listUserScheduledReports(currentUser.uid),
                listUserTemplates(currentUser.uid),
            ]);

            setSchedules(schedulesData);
            setTemplates(templatesData);

            // Load Google Ads accounts separately
            if (isGoogleAdsConnected) {
                try {
                    const accountsResponse = await fetchAccessibleCustomers();
                    if (accountsResponse.success && accountsResponse.customers) {
                        const accountsList = accountsResponse.customers.map((customer: any) => ({
                            id: customer.id,
                            name: customer.descriptiveName || customer.id,
                        }));
                        setAccounts(accountsList);
                    } else {
                        setAccounts([]);
                        if (accountsResponse.error && (
                            accountsResponse.error.includes('invalid_grant') ||
                            accountsResponse.error.includes('UNAUTHENTICATED')
                        )) {
                            setGoogleAuthError(true);
                            toast.error('Session Google Ads expirée. Veuillez vous reconnecter dans les paramètres.');
                        }
                    }
                } catch (err) {
                    console.error('Error fetching Google Ads accounts:', err);
                }
            } else {
                setAccounts([]);
            }

        } catch (error: any) {
            console.error('Error loading data:', error);
            toast.error('Erreur lors du chargement des données. Veuillez rafraîchir la page.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSchedule = () => {
        setEditingSchedule(undefined);
        setIsModalOpen(true);
    };

    const handleEditSchedule = (schedule: ScheduledReport) => {
        setEditingSchedule(schedule);
        setIsModalOpen(true);
    };

    const handleSaveSchedule = async (data: ScheduleFormData) => {
        if (!currentUser) return;

        try {
            if (editingSchedule) {
                // Update existing schedule
                await updateScheduledReport(editingSchedule.id, {
                    name: data.name,
                    description: data.description,
                    templateId: data.templateId,
                    accountId: data.accountId,
                    scheduleConfig: data.scheduleConfig,
                });
                toast.success('Schedule mis à jour avec succès');
            } else {
                // Create new schedule
                await createScheduledReport(currentUser.uid, {
                    name: data.name,
                    description: data.description,
                    templateId: data.templateId,
                    accountId: data.accountId,
                    scheduleConfig: data.scheduleConfig,
                });
                toast.success('Schedule créé avec succès');
            }

            setIsModalOpen(false);
            setEditingSchedule(undefined);
            await loadData();
        } catch (error: any) {
            console.error('Error saving schedule:', error);
            toast.error(error.message || 'Erreur lors de la sauvegarde du schedule');
        }
    };

    const handleDeleteSchedule = (schedule: ScheduledReport) => {
        setScheduleToDelete(schedule);
        setDeleteModalOpen(true);
    };

    const confirmDeleteSchedule = async () => {
        if (!scheduleToDelete) return;

        try {
            await deleteScheduledReport(scheduleToDelete.id);
            toast.success('Schedule supprimé avec succès');
            setScheduleToDelete(null);
            await loadData();
        } catch (error: any) {
            console.error('Error deleting schedule:', error);
            toast.error('Erreur lors de la suppression du schedule');
        }
    };

    const handleToggleStatus = async (schedule: ScheduledReport, isActive: boolean) => {
        try {
            await toggleScheduleStatus(schedule.id, isActive);
            toast.success(isActive ? 'Schedule activé' : 'Schedule mis en pause');
            await loadData();
        } catch (error: any) {
            console.error('Error toggling schedule status:', error);
            toast.error('Erreur lors de la modification du statut');
        }
    };

    const getTemplateName = (templateId: string): string => {
        return templates.find(t => t.id === templateId)?.name || 'Template inconnu';
    };

    const getAccountName = (accountId: string): string => {
        return accounts.find(a => a.id === accountId)?.name || 'Compte inconnu';
    };

    const activeSchedules = schedules.filter(s => s.isActive);
    const pausedSchedules = schedules.filter(s => !s.isActive);

    if (loading) {
        return (
            <div className="scheduled-reports-loading">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="scheduled-reports-page">
            <div className="page-header">
                <div className="header-content">
                    <div className="header-title-row">
                        <Clock size={32} className="header-icon" />
                        <h1>Rapports programmés</h1>
                        <button
                            className="btn-create"
                            onClick={handleCreateSchedule}
                            disabled={templates.length === 0 || !isGoogleAdsConnected}
                            style={{
                                opacity: (templates.length === 0 || !isGoogleAdsConnected) ? 0.5 : 1,
                                cursor: (templates.length === 0 || !isGoogleAdsConnected) ? 'not-allowed' : 'pointer',
                                marginLeft: 'auto'
                            }}
                            title={!isGoogleAdsConnected ? 'Connectez Google Ads pour créer des schedules' : templates.length === 0 ? 'Créez d\'abord un template' : ''}
                        >
                            <Plus size={20} />
                            <span>Nouveau schedule</span>
                        </button>
                    </div>
                    <p className="header-subtitle">
                        Automatisez la génération de vos rapports sur une base régulière
                    </p>
                </div>
            </div>

            <FeatureAccessGuard featureName="les rapports programmés">

                {googleAuthError && isGoogleAdsConnected && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-300">Connexion Google Ads requise</h3>
                            <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                Impossible de récupérer vos comptes Google Ads. La session a probablement expiré.
                                <a href="/app/settings" className="underline ml-1 font-medium hover:text-red-900 dark:hover:text-red-200">
                                    Reconnecter le compte
                                </a>
                            </p>
                        </div>
                    </div>
                )}

                {templates.length === 0 && (
                    <div className="empty-state warning">
                        <AlertCircle size={48} />
                        <h3>Aucun template disponible</h3>
                        <p>
                            La programmation nécessite un <strong>modèle (template)</strong> pour générer les rapports.
                            Vos rapports existants (page Rapports) ne sont pas des templates.
                        </p>
                        <a href="/app/templates" className="btn-link">
                            Créer un template →
                        </a>
                    </div>
                )}

                {templates.length > 0 && schedules.length === 0 && (
                    <div className="empty-state">
                        <Clock size={64} />
                        <h3>Aucun rapport programmé</h3>
                        <p>Créez votre premier schedule pour automatiser la génération de rapports.</p>
                        <button
                            className="btn-primary"
                            onClick={handleCreateSchedule}
                            disabled={!isGoogleAdsConnected}
                            style={{
                                opacity: !isGoogleAdsConnected ? 0.5 : 1,
                                cursor: !isGoogleAdsConnected ? 'not-allowed' : 'pointer'
                            }}
                        >
                            <Plus size={20} />
                            <span>Créer un schedule</span>
                        </button>
                    </div>
                )}

                {schedules.length > 0 && (
                    <>
                        {activeSchedules.length > 0 && (
                            <div className="schedules-section">
                                <h2 className="section-title">
                                    Schedules actifs
                                    <span className="count-badge">{activeSchedules.length}</span>
                                </h2>
                                <div className="schedules-grid">
                                    {activeSchedules.map((schedule) => (
                                        <ScheduleCard
                                            key={schedule.id}
                                            schedule={schedule}
                                            templateName={getTemplateName(schedule.templateId)}
                                            accountName={getAccountName(schedule.accountId)}
                                            onEdit={handleEditSchedule}
                                            onDelete={handleDeleteSchedule}
                                            onToggleStatus={handleToggleStatus}
                                            isGoogleAdsConnected={isGoogleAdsConnected}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {pausedSchedules.length > 0 && (
                            <div className="schedules-section">
                                <h2 className="section-title">
                                    Schedules en pause
                                    <span className="count-badge secondary">{pausedSchedules.length}</span>
                                </h2>
                                <div className="schedules-grid">
                                    {pausedSchedules.map((schedule) => (
                                        <ScheduleCard
                                            key={schedule.id}
                                            schedule={schedule}
                                            templateName={getTemplateName(schedule.templateId)}
                                            accountName={getAccountName(schedule.accountId)}
                                            onEdit={handleEditSchedule}
                                            onDelete={handleDeleteSchedule}
                                            onToggleStatus={handleToggleStatus}
                                            isGoogleAdsConnected={isGoogleAdsConnected}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}

                <ScheduleConfigModal
                    isOpen={isModalOpen}
                    onClose={() => {
                        setIsModalOpen(false);
                        setEditingSchedule(undefined);
                    }}
                    onSave={handleSaveSchedule}
                    templates={templates}
                    accounts={accounts}
                    editingSchedule={editingSchedule}
                />

                <ConfirmationModal
                    isOpen={deleteModalOpen}
                    onClose={() => {
                        setDeleteModalOpen(false);
                        setScheduleToDelete(null);
                    }}
                    onConfirm={confirmDeleteSchedule}
                    title="Supprimer le schedule"
                    message={`Êtes-vous sûr de vouloir supprimer le schedule "${scheduleToDelete?.name}" ? Cette action est irréversible.`}
                    confirmLabel="Supprimer"
                    isDestructive={true}
                />
            </FeatureAccessGuard>
        </div>
    );
};

export default ScheduledReports;
