import React, { useState, useEffect } from 'react';
import { Plus, Clock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
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
import ScheduleConfigModal, { type ScheduleFormData } from '../components/schedules/ScheduleConfigModal';
import Spinner from '../components/common/Spinner';
import toast from 'react-hot-toast';
import './ScheduledReports.css';

interface GoogleAdsAccount {
    id: string;
    name: string;
}

const ScheduledReports: React.FC = () => {
    const { currentUser } = useAuth();
    const [schedules, setSchedules] = useState<ScheduledReport[]>([]);
    const [templates, setTemplates] = useState<ReportTemplate[]>([]);
    const [accounts, setAccounts] = useState<GoogleAdsAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSchedule, setEditingSchedule] = useState<ScheduledReport | undefined>();

    useEffect(() => {
        if (currentUser) {
            loadData();
        }
    }, [currentUser]);

    const loadData = async () => {
        if (!currentUser) return;

        setLoading(true);
        try {
            const [schedulesData, templatesData, accountsResponse] = await Promise.all([
                listUserScheduledReports(currentUser.uid),
                listUserTemplates(currentUser.uid),
                fetchAccessibleCustomers(),
            ]);

            setSchedules(schedulesData);
            setTemplates(templatesData);

            // Handle the response from fetchAccessibleCustomers
            if (accountsResponse.success && accountsResponse.customers) {
                const accountsList = accountsResponse.customers.map((customer: any) => ({
                    id: customer.id,
                    name: customer.descriptiveName || customer.id,
                }));
                setAccounts(accountsList);
            } else {
                setAccounts([]);
            }
        } catch (error: any) {
            console.error('Error loading data:', error);
            toast.error('Erreur lors du chargement des données');
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

    const handleDeleteSchedule = async (schedule: ScheduledReport) => {
        if (!confirm(`Êtes-vous sûr de vouloir supprimer le schedule "${schedule.name}" ?`)) {
            return;
        }

        try {
            await deleteScheduledReport(schedule.id);
            toast.success('Schedule supprimé avec succès');
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
                    <div className="header-title">
                        <Clock size={32} className="header-icon" />
                        <div>
                            <h1>Rapports programmés</h1>
                            <p className="header-subtitle">
                                Automatisez la génération de vos rapports sur une base régulière
                            </p>
                        </div>
                    </div>
                    <button className="btn-create" onClick={handleCreateSchedule}>
                        <Plus size={20} />
                        <span>Nouveau schedule</span>
                    </button>
                </div>
            </div>

            {templates.length === 0 && (
                <div className="empty-state warning">
                    <AlertCircle size={48} />
                    <h3>Aucun template disponible</h3>
                    <p>Vous devez d'abord créer un template de rapport avant de pouvoir programmer des rapports automatiques.</p>
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
                    <button className="btn-primary" onClick={handleCreateSchedule}>
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
        </div>
    );
};

export default ScheduledReports;
