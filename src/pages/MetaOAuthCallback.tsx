import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../firebase/config';

const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL || 'https://us-central1-flipika.cloudfunctions.net';

/**
 * Meta OAuth Callback page
 * Handles the redirect from Facebook OAuth and exchanges the code for tokens
 */
const MetaOAuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const error = searchParams.get('error');
            const errorReason = searchParams.get('error_reason');

            // Handle OAuth errors from Facebook
            if (error) {
                console.error('Meta OAuth error:', error, errorReason);
                setStatus('error');
                setErrorMessage(
                    errorReason === 'user_denied'
                        ? 'Authorization was denied'
                        : 'Authorization failed'
                );
                setTimeout(() => navigate('/app/settings'), 3000);
                return;
            }

            // Validate parameters
            if (!code || !state) {
                console.error('Missing code or state parameter');
                setStatus('error');
                setErrorMessage('Invalid callback parameters');
                setTimeout(() => navigate('/app/settings'), 3000);
                return;
            }

            try {
                const user = auth.currentUser;
                if (!user) {
                    throw new Error('User not authenticated');
                }

                const idToken = await user.getIdToken();

                // Call the Cloud Function to exchange the code via POST
                console.log('Sending Meta OAuth callback with state:', state.substring(0, 12) + '...');
                const response = await fetch(
                    `${FUNCTIONS_BASE_URL}/handleMetaOAuthCallback`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${idToken}`,
                        },
                        body: JSON.stringify({ code, state }),
                    }
                );

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    console.error('Meta OAuth exchange error:', errorData);
                    throw new Error(errorData.error || `Failed to exchange Meta OAuth code: ${response.status}`);
                }

                console.log('Meta OAuth callback successful');
                setStatus('success');
                setTimeout(() => navigate('/app/settings'), 2000);
            } catch (error: any) {
                console.error('Error handling Meta OAuth callback:', error);
                setStatus('error');
                setErrorMessage(error.message || 'Failed to connect your Meta Ads account');
                setTimeout(() => navigate('/app/settings'), 3000);
            }
        };

        handleCallback();
    }, [searchParams, navigate]);

    if (status === 'error') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-secondary)]">
                <div className="max-w-md w-full p-8 glass rounded-2xl border border-red-500/20">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold text-red-500 mb-2">Connection Failed</h1>
                        <p className="text-[var(--color-text-secondary)] mb-4">{errorMessage}</p>
                        <p className="text-sm text-[var(--color-text-muted)]">Redirecting to settings...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-secondary)]">
                <div className="max-w-md w-full p-8 glass rounded-2xl border border-green-500/20">
                    <div className="text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/10 flex items-center justify-center">
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-bold gradient-text mb-2">Successfully Connected!</h1>
                        <p className="text-[var(--color-text-secondary)] mb-4">Your Meta Ads account has been connected</p>
                        <p className="text-sm text-[var(--color-text-muted)]">Redirecting to settings...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Processing state
    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg-secondary)]">
            <div className="max-w-md w-full p-8 glass rounded-2xl">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[var(--color-primary)]"></div>
                    </div>
                    <h1 className="text-2xl font-bold gradient-text mb-2">Processing...</h1>
                    <p className="text-[var(--color-text-secondary)]">Completing your Meta Ads connection</p>
                </div>
            </div>
        </div>
    );
};

export default MetaOAuthCallback;
