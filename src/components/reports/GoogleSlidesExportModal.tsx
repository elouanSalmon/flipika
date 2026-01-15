import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { X } from 'lucide-react';
import { ExportToGoogleSlidesButton } from './ExportToGoogleSlidesButton';
import type { FlipikaSlideData } from '../../types/googleSlides';

interface GoogleSlidesExportModalProps {
    isOpen: boolean;
    onClose: () => void;
    reportId: string;
    reportTitle: string;
    slides: FlipikaSlideData[];
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
}) => {
    if (!isOpen) return null;

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Exporter vers Google Slides
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {reportTitle}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            aria-label="Fermer"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <div className="mb-6">
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    <strong>📊 {slides.length} slide{slides.length > 1 ? 's' : ''}</strong> seront exportées vers Google Slides
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                                    La présentation sera créée dans votre Google Drive et s'ouvrira automatiquement.
                                </p>
                            </div>
                        </div>

                        {/* Export Button */}
                        <div className="flex justify-center">
                            <ExportToGoogleSlidesButton
                                reportId={reportId}
                                reportTitle={reportTitle}
                                slides={slides}
                                className="w-full"
                            />
                        </div>

                        {/* Info */}
                        <div className="mt-6 text-xs text-gray-500 dark:text-gray-400">
                            <p>
                                <strong>Note :</strong> Vous devrez autoriser Flipika à accéder à votre Google Drive
                                lors de la première utilisation.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Annuler
                        </button>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};
