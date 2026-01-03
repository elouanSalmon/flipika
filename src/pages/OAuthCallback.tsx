import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { auth } from '../firebase/config';

const FUNCTIONS_BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL || 'https://us-central1-flipika.cloudfunctions.net';

/**
 * OAuth Callback page
 * Handles the redirect from Google OAuth and exchanges the code for tokens
 */
const OAuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const handleOAuthCallback = async () => {
            const code = searchParams.get('code');
            const state = searchParams.get('state');
            const error = searchParams.get('error');

            // Handle OAuth errors from Google
            if (error) {
                console.error('OAuth error from Google:', error);
                setStatus('error');
                setErrorMessage('Authorization was denied or failed');
                setTimeout(() => navigate('/app/reports'), 3000);
                return;
            }

            // Validate we have the required parameters
            if (!code || !state) {
                console.error('Missing code or state parameter');
                setStatus('error');
                setErrorMessage('Invalid callback parameters');
                setTimeout(() => navigate('/app/reports'), 3000);
                return;
            }

            try {
                // Get the current user's ID token
                const user = auth.currentUser;
                if (!user) {
                    throw new Error('User not authenticated');
                }
                const idToken = await user.getIdToken();

                // Call the Cloud Function to exchange the code for tokens
                const response = await fetch(`${FUNCTIONS_BASE_URL}/handleOAuthCallback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${idToken}`
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to exchange OAuth code: ${response.status}`);
                }

                // Success!
                console.log('OAuth callback successful');
                setStatus('success');

                // Redirect after showing success message
                setTimeout(() => navigate('/app/reports'), 2000);

            } catch (error: any) {
                console.error('Error handling OAuth callback:', error);
                setStatus('error');
                setErrorMessage(error.message || 'Failed to connect your Google Ads account');
                setTimeout(() => navigate('/app/reports'), 3000);
            }
        };

        handleOAuthCallback();
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
                        <p className="text-[var(--color-text-secondary)] mb-4">
                            {errorMessage}
                        </p>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            Redirecting to reports...
                        </p>
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
                        <p className="text-[var(--color-text-secondary)] mb-4">
                            Your Google Ads account has been connected
                        </p>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            Redirecting to reports...
                        </p>
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
                    <p className="text-[var(--color-text-secondary)]">
                        Completing your Google Ads connection
                    </p>
                </div>
            </div>
        </div>
    );
};

export default OAuthCallback;
