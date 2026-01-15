import { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';

/**
 * POC 1: Google OAuth Authentication Test
 * 
 * Objectif: Tester le flow OAuth et obtenir un access token
 * 
 * Critères de succès:
 * - ✅ Bouton "Sign in with Google" fonctionne
 * - ✅ Popup OAuth s'ouvre
 * - ✅ Access token reçu et affiché
 * - ✅ Token stocké dans localStorage
 */

const SCOPES = [
    'https://www.googleapis.com/auth/presentations',
    'https://www.googleapis.com/auth/drive.file'
].join(' ');

export const GoogleAuthTest = () => {
    const [accessToken, setAccessToken] = useState<string | null>(
        localStorage.getItem('google_access_token')
    );
    const [error, setError] = useState<string | null>(null);

    const login = useGoogleLogin({
        scope: SCOPES,
        onSuccess: (tokenResponse) => {
            console.log('✅ OAuth Success:', tokenResponse);
            setAccessToken(tokenResponse.access_token);
            localStorage.setItem('google_access_token', tokenResponse.access_token);
            setError(null);
        },
        onError: (error) => {
            console.error('❌ OAuth Error:', error);
            setError(JSON.stringify(error, null, 2));
        }
    });

    const handleLogout = () => {
        localStorage.removeItem('google_access_token');
        setAccessToken(null);
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-4">
                    POC 1: Google OAuth Test
                </h1>

                <div className="mb-6">
                    <p className="text-gray-600 mb-2">
                        <strong>Objectif:</strong> Valider le flow OAuth 2.0
                    </p>
                    <p className="text-sm text-gray-500">
                        Scopes: presentations, drive.file
                    </p>
                </div>

                {!accessToken ? (
                    <div>
                        <button
                            onClick={() => login()}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
                        >
                            🔐 Sign in with Google
                        </button>

                        {error && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                                <p className="text-red-800 font-semibold mb-2">Error:</p>
                                <pre className="text-xs text-red-600 overflow-auto">
                                    {error}
                                </pre>
                            </div>
                        )}
                    </div>
                ) : (
                    <div>
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
                            <p className="text-green-800 font-semibold mb-2">
                                ✅ Authenticated!
                            </p>
                            <p className="text-sm text-gray-600 mb-2">Access Token:</p>
                            <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                                {accessToken}
                            </pre>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={handleLogout}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                            >
                                Logout
                            </button>

                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(accessToken);
                                    alert('Token copied to clipboard!');
                                }}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                            >
                                Copy Token
                            </button>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800">
                                <strong>✅ POC 1 Success!</strong>
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                OAuth flow works. Token stored in localStorage.
                                Ready for POC 2 (Create Presentation).
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
