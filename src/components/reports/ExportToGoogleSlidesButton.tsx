import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
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
            toast.success('Authentifié avec Google !');
        },
        onError: (error) => {
            console.error('OAuth Error:', error);
            toast.error('Erreur d\'authentification Google');
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
            toast.loading('Création de la présentation...', { id: 'export' });
            console.log('📊 Creating presentation:', reportTitle);
            console.log('📊 Slides to export:', slides.length);

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

            toast.success('Présentation créée !', { id: 'export' });

            // Open presentation in new tab
            window.open(presentation.presentationUrl, '_blank');
        } catch (error: any) {
            console.error('❌ Export error:', error);
            console.error('❌ Error code:', error.code);
            console.error('❌ Error message:', error.message);
            console.error('❌ Error stack:', error.stack);

            // More specific error messages
            if (error.code === 'permission-denied') {
                toast.error('Erreur de permissions Firestore', { id: 'export' });
            } else if (error.message?.includes('presentations')) {
                toast.error('Erreur API Google Slides', { id: 'export' });
            } else {
                toast.error(`Erreur d'export: ${error.message}`, { id: 'export' });
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
                    🔐 Se connecter à Google
                </button>
            )}

            <button
                onClick={handleExport}
                disabled={isExporting || !isAuthenticated}
                className={`btn-primary ${className}`}
            >
                {isExporting ? (
                    <>
                        <span className="animate-spin mr-2">⏳</span>
                        Export en cours...
                    </>
                ) : (
                    <>
                        📊 Exporter vers Google Slides
                    </>
                )}
            </button>
        </div>
    );
};
