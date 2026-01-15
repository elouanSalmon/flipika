import React, { useState } from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { X, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ExportToGoogleSlidesButton } from './ExportToGoogleSlidesButton';
import type { FlipikaSlideData } from '../../types/googleSlides';
import type { SlideConfig } from '../../types/reportTypes';
import { extractSlidesDataForExport } from '../../services/slideDataExtractor';
import toast from 'react-hot-toast';
import './GoogleSlidesExportModal.css';

interface GoogleSlidesExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportId: string;
    reportTitle: string;
    slides: SlideConfig[];
    accountId: string;
    campaignIds: string[];
    startDate?: Date;
    endDate?: Date;
}

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

/**
 * Modal for exporting report to Google Slides
 * 
 * Displays export options and handles OAuth + API integration
 */
export const GoogleSlidesExportModal: React.FC<GoogleSlidesExportModalProps> = ({
    isOpen,
    onClose,
    reportId,
    reportTitle,
    slides,
    accountId,
    campaignIds,
    startDate,
    endDate,
}) => {
    const { t } = useTranslation('reports');
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractedSlides, setExtractedSlides] = useState<FlipikaSlideData[] | null>(null);

    if (!isOpen) return null;

    // Extract data when modal opens (only once)
    React.useEffect(() => {
        if (isOpen && !extractedSlides && !isExtracting) {
            extractData();
        }
    }, [isOpen]);

    const extractData = async () => {
        setIsExtracting(true);
        toast.loading(t('header.export.extracting'), { id: 'extract' });

        try {
            const data = await extractSlidesDataForExport(
                slides,
                accountId,
                campaignIds,
                startDate,
                endDate,
                reportId
            );
            setExtractedSlides(data);
            toast.success(
                t(`header.export.ready_${data.length === 1 ? 'one' : 'other'}`, { count: data.length }),
                { id: 'extract' }
            );
        } catch (error) {
            console.error('Error extracting slide data:', error);
            toast.error(t('header.export.error'), { id: 'extract' });
            // Fallback to basic data
            setExtractedSlides(slides.map(slide => ({
                type: slide.type as FlipikaSlideData['type'],
                title: slide.title || slide.type.replace(/_/g, ' ').toUpperCase(),
                data: {},
            })));
        } finally {
            setIsExtracting(false);
        }
    };

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="modal-overlay" onClick={onClose}>
                <div className="modal-container export-modal" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="modal-header">
                        <div className="modal-header-content">
                            <div className="modal-icon">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h2 className="modal-title">{t('header.export.title')}</h2>
                                <p className="modal-subtitle">{reportTitle}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="modal-close-btn"
                            aria-label={t('editor.close')}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="modal-body">
                        {/* Info Card */}
                        <div className="export-info-card">
                            <div className="export-info-content">
                                <p className="export-info-title">
                                    <strong>
                                        {t(`header.export.slideCount_${slides.length === 1 ? 'one' : 'other'}`, {
                                            count: slides.length
                                        })}
                                    </strong>
                                </p>
                                <p className="export-info-description">
                                    {t('header.export.info')}
                                </p>
                            </div>
                        </div>

                        {/* Export Button */}
                        <div className="export-button-container">
                            {isExtracting ? (
                                <div className="export-loading">
                                    <div className="export-loading-spinner" />
                                    <span>{t('header.export.extracting')}</span>
                                </div>
                            ) : extractedSlides ? (
                                <ExportToGoogleSlidesButton
                                    reportId={reportId}
                                    reportTitle={reportTitle}
                                    slides={extractedSlides}
                                    className="w-full"
                                />
                            ) : (
                                <button
                                    onClick={extractData}
                                    className="btn btn-primary w-full"
                                >
                                    {t('header.export.preparing')}
                                </button>
                            )}
                        </div>

                        {/* Note */}
                        <p className="export-note">
                            <strong>{t('header.export.noteLabel')}</strong> {t('header.export.note')}
                        </p>
                    </div>

                    {/* Footer */}
                    <div className="modal-actions">
                        <button
                            onClick={onClose}
                            className="btn btn-secondary"
                        >
                            {t('header.export.cancel')}
                        </button>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};
