import { useState } from 'react';

/**
 * POC 2: Create Google Slides Presentation
 * 
 * Objectif: Utiliser l'API pour créer une présentation vide
 * 
 * Critères de succès:
 * - ✅ Présentation créée dans Google Drive
 * - ✅ presentationId retourné
 * - ✅ Lien vers présentation fonctionne
 */

interface Presentation {
    presentationId: string;
    title: string;
    presentationUrl: string;
}

export const CreatePresentationTest = () => {
    const [presentation, setPresentation] = useState<Presentation | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createPresentation = async () => {
        const accessToken = localStorage.getItem('google_access_token');

        if (!accessToken) {
            setError('No access token found. Please authenticate first (POC 1).');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const title = `Flipika Test - ${new Date().toLocaleString('fr-FR')}`;

            const response = await fetch(
                'https://slides.googleapis.com/v1/presentations',
                {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ title })
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData, null, 2));
            }

            const data = await response.json();

            const presentationData: Presentation = {
                presentationId: data.presentationId,
                title: data.title,
                presentationUrl: `https://docs.google.com/presentation/d/${data.presentationId}/edit`
            };

            setPresentation(presentationData);
            console.log('✅ Presentation created:', presentationData);

        } catch (err: any) {
            console.error('❌ Error creating presentation:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-4">
                    POC 2: Create Presentation Test
                </h1>

                <div className="mb-6">
                    <p className="text-gray-600 mb-2">
                        <strong>Objectif:</strong> Créer une présentation vide via API
                    </p>
                    <p className="text-sm text-gray-500">
                        Endpoint: POST /v1/presentations
                    </p>
                </div>

                <button
                    onClick={createPresentation}
                    disabled={loading}
                    className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition disabled:bg-gray-400"
                >
                    {loading ? '⏳ Creating...' : '📊 Create Presentation'}
                </button>

                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                        <p className="text-red-800 font-semibold mb-2">Error:</p>
                        <pre className="text-xs text-red-600 overflow-auto max-h-64">
                            {error}
                        </pre>
                    </div>
                )}

                {presentation && (
                    <div className="mt-6">
                        <div className="p-4 bg-green-50 border border-green-200 rounded mb-4">
                            <p className="text-green-800 font-semibold mb-3">
                                ✅ Presentation Created!
                            </p>

                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="font-semibold text-gray-700">Title:</span>
                                    <p className="text-gray-600">{presentation.title}</p>
                                </div>

                                <div>
                                    <span className="font-semibold text-gray-700">ID:</span>
                                    <p className="text-gray-600 font-mono text-xs">
                                        {presentation.presentationId}
                                    </p>
                                </div>

                                <div>
                                    <span className="font-semibold text-gray-700">URL:</span>
                                    <a
                                        href={presentation.presentationUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:underline text-xs break-all"
                                    >
                                        {presentation.presentationUrl}
                                    </a>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <a
                                href={presentation.presentationUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition inline-block"
                            >
                                🔗 Open in Google Slides
                            </a>

                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(presentation.presentationId);
                                    alert('Presentation ID copied!');
                                }}
                                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                            >
                                Copy ID
                            </button>
                        </div>

                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800">
                                <strong>✅ POC 2 Success!</strong>
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                Presentation created successfully. Ready for POC 3 (Add Slides).
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
