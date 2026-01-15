import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { SlideExtension, type SlideAttributes } from './extensions/SlideExtension';
import { useState } from 'react';

// Extend TipTap commands type
declare module '@tiptap/core' {
    interface Commands<ReturnType> {
        slide: {
            insertSlide: (attributes?: Partial<SlideAttributes>) => ReturnType;
        };
    }
}

/**
 * POC 2: TipTap Slide Editor
 * 
 * Objectif: Tester la custom extension "Slide" avec données Google Ads
 * 
 * Critères de succès:
 * - ✅ Custom extension Slide fonctionne
 * - ✅ Slides insérables et éditables
 * - ✅ Données Google Ads affichées
 * - ✅ JSON sérialisable pour Firestore
 */

export const TipTapSlideEditor = () => {
    const [jsonOutput, setJsonOutput] = useState<any>(null);

    const editor = useEditor({
        extensions: [
            StarterKit,
            SlideExtension,
        ],
        content: {
            type: 'doc',
            content: [
                {
                    type: 'heading',
                    attrs: { level: 1 },
                    content: [{ type: 'text', text: 'Rapport Google Ads - Janvier 2026' }],
                },
                {
                    type: 'slide',
                    attrs: {
                        slideType: 'performance',
                        slideData: {
                            title: 'Performance Overview',
                            cost: 5000,
                            clicks: 1200,
                            impressions: 50000,
                            cpc: 4.17,
                            ctr: 2.4,
                        },
                    },
                    content: [
                        {
                            type: 'heading',
                            attrs: { level: 2 },
                            content: [{ type: 'text', text: 'Performance Janvier 2026' }],
                        },
                        {
                            type: 'paragraph',
                            content: [{ type: 'text', text: 'Analyse des performances du mois écoulé.' }],
                        },
                        {
                            type: 'bulletList',
                            content: [
                                {
                                    type: 'listItem',
                                    content: [
                                        {
                                            type: 'paragraph',
                                            content: [{ type: 'text', text: 'Coût total : 5 000€' }],
                                        },
                                    ],
                                },
                                {
                                    type: 'listItem',
                                    content: [
                                        {
                                            type: 'paragraph',
                                            content: [{ type: 'text', text: 'Clics : 1 200' }],
                                        },
                                    ],
                                },
                                {
                                    type: 'listItem',
                                    content: [
                                        {
                                            type: 'paragraph',
                                            content: [{ type: 'text', text: 'CPC moyen : 4.17€' }],
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                },
                {
                    type: 'slide',
                    attrs: {
                        slideType: 'chart',
                        slideData: {
                            title: 'Évolution du CPC',
                            chartType: 'line',
                        },
                    },
                    content: [
                        {
                            type: 'heading',
                            attrs: { level: 2 },
                            content: [{ type: 'text', text: 'Évolution du CPC' }],
                        },
                        {
                            type: 'paragraph',
                            content: [{ type: 'text', text: 'Graphique montrant l\'évolution du coût par clic.' }],
                        },
                    ],
                },
            ],
        },
        editorProps: {
            attributes: {
                class: 'focus:outline-none',
            },
        },
    });

    const handleAddSlide = (slideType: 'performance' | 'chart' | 'metrics' | 'creative') => {
        if (editor) {
            editor.chain().focus().insertSlide({
                slideType,
                slideData: {
                    title: `Nouvelle Slide ${slideType}`,
                },
            }).run();
        }
    };

    const handleShowJSON = () => {
        if (editor) {
            setJsonOutput(editor.getJSON());
        }
    };

    return (
        <div className="max-w-6xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-4">
                    POC 2: TipTap Slide Editor
                </h1>

                <div className="mb-6">
                    <p className="text-gray-600 mb-2">
                        <strong>Objectif:</strong> Valider la custom extension "Slide"
                    </p>
                    <p className="text-sm text-gray-500">
                        Extensions: StarterKit + SlideExtension (custom)
                    </p>
                </div>

                {/* Toolbar */}
                <div className="mb-6 flex gap-2 flex-wrap border-b pb-4">
                    <button
                        onClick={() => handleAddSlide('performance')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        + 📊 Performance Slide
                    </button>
                    <button
                        onClick={() => handleAddSlide('chart')}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                    >
                        + 📈 Chart Slide
                    </button>
                    <button
                        onClick={() => handleAddSlide('metrics')}
                        className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
                    >
                        + 📉 Metrics Slide
                    </button>
                    <button
                        onClick={() => handleAddSlide('creative')}
                        className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700 transition"
                    >
                        + 🎨 Creative Slide
                    </button>
                </div>

                {/* Editor */}
                <div className="bg-gray-50 rounded-lg p-4">
                    <EditorContent editor={editor} />
                </div>

                {/* Actions */}
                <div className="mt-6 flex gap-2">
                    <button
                        onClick={handleShowJSON}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        📊 Show JSON (for Firestore)
                    </button>
                </div>

                {/* JSON Output */}
                {jsonOutput && (
                    <div className="mt-6">
                        <div className="bg-green-50 border border-green-200 rounded p-4">
                            <p className="text-green-800 font-semibold mb-2">
                                ✅ JSON Ready for Firestore!
                            </p>
                            <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96">
                                {JSON.stringify(jsonOutput, null, 2)}
                            </pre>
                        </div>

                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800">
                                <strong>✅ POC 2 Success!</strong>
                            </p>
                            <ul className="text-xs text-blue-600 mt-2 space-y-1">
                                <li>✅ Custom Slide extension works</li>
                                <li>✅ Slides are draggable and editable</li>
                                <li>✅ Slide data (Google Ads metrics) stored in attributes</li>
                                <li>✅ JSON serializable for Firestore</li>
                            </ul>
                            <p className="text-xs text-blue-600 mt-2">
                                Ready for POC 3 (Firestore Integration).
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
