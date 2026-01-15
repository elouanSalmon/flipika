import { GoogleOAuthProvider } from '@react-oauth/google';
import { GoogleAuthTest } from './GoogleAuthTest';
import { CreatePresentationTest } from './CreatePresentationTest';

/**
 * Spike Dashboard - Google Slides API
 * 
 * Page principale pour tester les POCs Google Slides API
 */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export const GoogleSlidesSpikeApp = () => {
    if (!GOOGLE_CLIENT_ID) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-2xl">
                    <h1 className="text-xl font-bold text-red-800 mb-2">
                        ⚠️ Configuration Required
                    </h1>
                    <p className="text-red-700 mb-4">
                        Google Client ID not found in environment variables.
                    </p>
                    <div className="bg-white p-4 rounded border">
                        <p className="text-sm font-semibold mb-2">Setup Instructions:</p>
                        <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                            <li>Create Google Cloud Project</li>
                            <li>Enable Google Slides API</li>
                            <li>Create OAuth 2.0 Client ID</li>
                            <li>Add to <code className="bg-gray-100 px-1 rounded">.env.development</code>:</li>
                        </ol>
                        <pre className="mt-2 bg-gray-100 p-2 rounded text-xs">
                            VITE_GOOGLE_CLIENT_ID=your_client_id_here
                        </pre>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
            <div className="min-h-screen bg-gray-100 py-8">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                        <h1 className="text-3xl font-bold mb-2">
                            🧪 Google Slides API - Spike Dashboard
                        </h1>
                        <p className="text-gray-600 mb-4">
                            POCs pour valider l'intégration Google Slides API
                        </p>

                        <div className="bg-blue-50 border border-blue-200 rounded p-4">
                            <p className="text-sm text-blue-800">
                                <strong>📋 Checklist:</strong>
                            </p>
                            <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                                <li>POC 1: OAuth Authentication ✅</li>
                                <li>POC 2: Create Presentation ✅</li>
                                <li>POC 3: Add Slide (à venir)</li>
                                <li>POC 4: Add Content (à venir)</li>
                            </ol>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <GoogleAuthTest />
                        <CreatePresentationTest />
                    </div>

                    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-bold mb-3">📚 Documentation</h2>
                        <ul className="text-sm text-gray-700 space-y-2">
                            <li>
                                📄 <a href="/SPIKE_GOOGLE_SLIDES.md" className="text-blue-600 hover:underline">
                                    SPIKE_GOOGLE_SLIDES.md
                                </a> - Documentation complète
                            </li>
                            <li>
                                🔗 <a
                                    href="https://developers.google.com/slides/api"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    Google Slides API Docs
                                </a>
                            </li>
                            <li>
                                🔗 <a
                                    href="https://console.cloud.google.com"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                >
                                    Google Cloud Console
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </GoogleOAuthProvider>
    );
};
