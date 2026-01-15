import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useTranslation } from 'react-i18next';
import { FileText, Loader2 } from 'lucide-react';
import { createGoogleSlidesService } from '../../services/googleSlidesService';
import type { FlipikaSlideData } from '../../types/googleSlides';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

interface ExportToGoogleSlidesButtonProps {
    reportId: string;
    reportTitle: string;
    slides: FlipikaSlideData[];
    className?: string;
}

const GOOGLE_SLIDES_SCOPES = [
    'https://www.googleapis.com/auth/presentations',
    'https://www.googleapis.com/auth/drive.file',
].join(' ');

export const ExportToGoogleSlidesButton = ({
    reportId,
    reportTitle,
    slides,
    className = '',
}: ExportToGoogleSlidesButtonProps) => {
    const { t } = useTranslation('reports');
    const { currentUser } = useAuth();
    const [isExporting, setIsExporting] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(
        !!localStorage.getItem('google_access_token')
    );

    const login = useGoogleLogin({
        scope: GOOGLE_SLIDES_SCOPES,
        onSuccess: (tokenResponse) => {
            localStorage.setItem('google_access_token', tokenResponse.access_token);
            setIsAuthenticated(true);
            toast.success(t('header.export.success'));
        },
        onError: (error) => {
            console.error('OAuth Error:', error);
            toast.error(t('header.export.error'));
        },
    });

    const handleExport = async () => {
        if (!currentUser) {
            toast.error('Vous devez être connecté');
            return;
        }

        if (!isAuthenticated) {
            toast.error('Veuillez vous authentifier avec Google d\'abord');
            login();
            return;
        }

        setIsExporting(true);

        try {
            // Create Google Slides service
            console.log('🔧 Creating Google Slides service...');
            const service = await createGoogleSlidesService();
            console.log('✅ Service created');

            // Create presentation
            toast.loading(t('header.export.creating'), { id: 'export' });
            console.log('Creating presentation:', reportTitle);
            console.log('Slides to export:', slides.length);

            const presentation = await service.createPresentationFromReport(
                reportTitle,
                slides
            );
            console.log('✅ Presentation created:', presentation);

            // Save export metadata to Firestore
            console.log('💾 Saving to Firestore...');
            const exportRef = doc(db, 'googleSlidesExports', `${reportId}_${Date.now()}`);
            const exportData = {
                reportId,
                presentationId: presentation.presentationId,
                presentationUrl: presentation.presentationUrl,
                title: reportTitle,
                createdAt: serverTimestamp(),
                userId: currentUser.uid,
                slideCount: slides.length,
            };
            console.log('💾 Export data:', exportData);

            await setDoc(exportRef, exportData);
            console.log('✅ Saved to Firestore');

            toast.success(t('header.export.success'), { id: 'export' });

            // Open presentation in new tab
            window.open(presentation.presentationUrl, '_blank');
        } catch (error: any) {
            console.error('❌ Export error:', error);
            console.error('❌ Error code:', error.code);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error stack:', error.stack);

            // Check if it's a 401 authentication error
            if (error.message?.includes('401') || error.message?.includes('UNAUTHENTICATED')) {
                console.log('🔑 Token expired, clearing and requesting re-authentication...');
                localStorage.removeItem('google_access_token');
                setIsAuthenticated(false);
                toast.error(t('header.export.sessionExpired'), { id: 'export' });
                // Automatically trigger login
                setTimeout(() => login(), 500);
                return;
            }

            // More specific error messages
            if (error.code === 'permission-denied') {
                toast.error(t('header.export.errorFirestore'), { id: 'export' });
            } else if (error.message?.includes('presentations')) {
                toast.error(t('header.export.errorAPI'), { id: 'export' });
            } else {
                toast.error(`${t('header.export.error')}: ${error.message}`, { id: 'export' });
            }
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex gap-2">
            {!isAuthenticated && (
                <button
                    onClick={() => login()}
                    className={`btn-secondary ${className}`}
                    disabled={isExporting}
                >
                    {t('header.export.connect')}
                </button>
            )}

            <button
                onClick={handleExport}
                disabled={isExporting || !isAuthenticated}
                className={`btn-primary ${className}`}
            >
                {isExporting ? (
                    <>
                        <Loader2 size={16} className="animate-spin mr-2" />
                        {t('header.export.creating')}
                    </>
                ) : (
                    <>
                        <FileText size={16} className="mr-2" />
                        {t('header.export.export')}
                    </>
                )}
            </button>
        </div>
    );
};
