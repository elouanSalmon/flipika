import { TipTapBasicEditor } from './TipTapBasicEditor';
import { TipTapSlideEditor } from './TipTapSlideEditor';

/**
 * Spike Dashboard - TipTap Editor
 * 
 * Page principale pour tester les POCs TipTap
 */

export const TipTapSpikeApp = () => {
    return (
        <div className="min-h-screen bg-gray-100 py-8">
            <div className="max-w-7xl mx-auto px-6">
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h1 className="text-3xl font-bold mb-2">
                        🧪 TipTap Editor - Spike Dashboard
                    </h1>
                    <p className="text-gray-600 mb-4">
                        POCs pour valider l'intégration TipTap/ProseMirror
                    </p>

                    <div className="bg-blue-50 border border-blue-200 rounded p-4">
                        <p className="text-sm text-blue-800">
                            <strong>📋 Checklist:</strong>
                        </p>
                        <ol className="text-sm text-blue-700 mt-2 space-y-1 list-decimal list-inside">
                            <li>POC 1: Basic Editor ✅</li>
                            <li>POC 2: Custom Slide Extension ✅</li>
                            <li>POC 3: Firestore Integration (à venir)</li>
                        </ol>
                    </div>
                </div>

                <div className="space-y-8">
                    <TipTapBasicEditor />
                    <TipTapSlideEditor />
                </div>

                <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
                    <h2 className="text-xl font-bold mb-3">📚 Documentation</h2>
                    <ul className="text-sm text-gray-700 space-y-2">
                        <li>
                            📄 <a href="/SPIKE_TIPTAP.md" className="text-blue-600 hover:underline">
                                SPIKE_TIPTAP.md
                            </a> - Documentation complète
                        </li>
                        <li>
                            🔗 <a
                                href="https://tiptap.dev/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                TipTap Documentation
                            </a>
                        </li>
                        <li>
                            🔗 <a
                                href="https://tiptap.dev/guide/custom-extensions"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                Custom Extensions Guide
                            </a>
                        </li>
                    </ul>
                </div>

                <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-6">
                    <h2 className="text-lg font-bold text-green-800 mb-2">
                        ✅ Spike Conclusions
                    </h2>
                    <div className="text-sm text-green-700 space-y-2">
                        <p><strong>Avantages TipTap :</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>Architecture document-first (comme Gamma)</li>
                            <li>Custom extensions faciles à créer</li>
                            <li>JSON serialization native (Firestore ready)</li>
                            <li>React integration excellente</li>
                            <li>DX moderne et documentation claire</li>
                        </ul>

                        <p className="mt-3"><strong>Pour Flipika :</strong></p>
                        <ul className="list-disc list-inside space-y-1 ml-4">
                            <li>✅ Parfait pour rapports structurés (Performance → Charts → Metrics)</li>
                            <li>✅ Prépare Epic 11 (AI Analysis) avec structure sémantique</li>
                            <li>✅ Collaboration future possible (Y.js)</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};
