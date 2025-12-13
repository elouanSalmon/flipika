import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/**
 * OAuth Callback page
 * Handles the redirect from Google OAuth and shows appropriate feedback
 */
const OAuthCallback = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const oauth = searchParams.get('oauth');
    const error = searchParams.get('error');
    const message = searchParams.get('message');

    useEffect(() => {
        // Auto-redirect after 2 seconds
        const timer = setTimeout(() => {
            navigate('/app/dashboard');
        }, 2000);

        return () => clearTimeout(timer);
    }, [navigate]);

    if (error) {
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
                            {message || 'Failed to connect your Google Ads account'}
                        </p>
                        <p className="text-sm text-[var(--color-text-muted)]">
                            Redirecting to dashboard...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (oauth === 'success') {
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
                            Redirecting to dashboard...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state
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
