import React from 'react';
import { useGoogleOneTapLogin, GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const GoogleOneTapInner: React.FC = () => {
    const { loginWithGoogleCredential, currentUser, loading } = useAuth();
    const navigate = useNavigate();
    const { t } = useTranslation();

    useGoogleOneTapLogin({
        onSuccess: async (credentialResponse) => {
            if (credentialResponse.credential) {
                try {
                    toast.loading(t('auth.login.inProgress') || 'Connexion en cours...', { id: 'google-one-tap' });
                    await loginWithGoogleCredential(credentialResponse.credential);
                    toast.success(t('auth.login.success') || 'Connexion réussie', { id: 'google-one-tap' });
                    navigate('/app');
                } catch (error) {
                    console.error('Google One Tap Login Failed', error);
                    toast.error(t('auth.login.error') || 'Échec de la connexion', { id: 'google-one-tap' });
                }
            }
        },
        onError: () => {
            console.error('Google One Tap Login Error');
        },
        // Only show when authentication loading is finished and user is not logged in
        disabled: loading || !!currentUser,
        use_fedcm_for_prompt: true,
    });

    return null;
};

export const GoogleOneTap: React.FC = () => {
    // Only render the provider if we actually have a Client ID
    if (!GOOGLE_CLIENT_ID) {
        return null;
    }

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <GoogleOneTapInner />
        </GoogleOAuthProvider>
    );
};
