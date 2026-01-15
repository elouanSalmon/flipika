import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useState } from 'react';

/**
 * POC 1: TipTap Basic Editor
 * 
 * Objectif: Tester l'éditeur basique avec StarterKit
 * 
 * Critères de succès:
 * - ✅ Éditeur s'affiche
 * - ✅ Texte éditable
 * - ✅ Formatage fonctionne (bold, italic, etc.)
 * - ✅ JSON sérialisable
 */

export const TipTapBasicEditor = () => {
    const [jsonOutput, setJsonOutput] = useState<any>(null);

    const editor = useEditor({
        extensions: [StarterKit],
        content: `
      <h2>Bienvenue dans TipTap ! 🎉</h2>
      <p>Ceci est un éditeur de texte riche basé sur ProseMirror.</p>
      <p>Vous pouvez :</p>
      <ul>
        <li>Écrire du texte</li>
        <li>Le formater en <strong>gras</strong> ou <em>italique</em></li>
        <li>Créer des listes</li>
        <li>Et bien plus !</li>
      </ul>
      <p>Testez l'édition ci-dessous ⬇️</p>
    `,
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg focus:outline-none min-h-[200px] p-4',
            },
        },
    });

    const handleShowJSON = () => {
        if (editor) {
            setJsonOutput(editor.getJSON());
        }
    };

    const handleShowHTML = () => {
        if (editor) {
            console.log('HTML:', editor.getHTML());
            alert('HTML logged to console');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h1 className="text-2xl font-bold mb-4">
                    POC 1: TipTap Basic Editor
                </h1>

                <div className="mb-6">
                    <p className="text-gray-600 mb-2">
                        <strong>Objectif:</strong> Valider l'éditeur basique TipTap
                    </p>
                    <p className="text-sm text-gray-500">
                        Extensions: StarterKit (heading, paragraph, bold, italic, lists, etc.)
                    </p>
                </div>

                {/* Toolbar */}
                {editor && (
                    <div className="mb-4 flex gap-2 flex-wrap border-b pb-4">
                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className={`px-3 py-1 rounded ${editor.isActive('bold') ? 'bg-blue-600 text-white' : 'bg-gray-200'
                                }`}
                        >
                            <strong>B</strong>
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className={`px-3 py-1 rounded ${editor.isActive('italic') ? 'bg-blue-600 text-white' : 'bg-gray-200'
                                }`}
                        >
                            <em>I</em>
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                            className={`px-3 py-1 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'bg-gray-200'
                                }`}
                        >
                            H2
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleBulletList().run()}
                            className={`px-3 py-1 rounded ${editor.isActive('bulletList') ? 'bg-blue-600 text-white' : 'bg-gray-200'
                                }`}
                        >
                            • List
                        </button>
                        <button
                            onClick={() => editor.chain().focus().toggleOrderedList().run()}
                            className={`px-3 py-1 rounded ${editor.isActive('orderedList') ? 'bg-blue-600 text-white' : 'bg-gray-200'
                                }`}
                        >
                            1. List
                        </button>
                    </div>
                )}

                {/* Editor */}
                <div className="border rounded-lg bg-white">
                    <EditorContent editor={editor} />
                </div>

                {/* Actions */}
                <div className="mt-4 flex gap-2">
                    <button
                        onClick={handleShowJSON}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        📊 Show JSON
                    </button>
                    <button
                        onClick={handleShowHTML}
                        className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition"
                    >
                        📝 Log HTML
                    </button>
                </div>

                {/* JSON Output */}
                {jsonOutput && (
                    <div className="mt-6">
                        <div className="bg-green-50 border border-green-200 rounded p-4">
                            <p className="text-green-800 font-semibold mb-2">
                                ✅ JSON Serialization Works!
                            </p>
                            <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-96">
                                {JSON.stringify(jsonOutput, null, 2)}
                            </pre>
                        </div>

                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded">
                            <p className="text-sm text-blue-800">
                                <strong>✅ POC 1 Success!</strong>
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                                TipTap editor works. Content is editable and serializable to JSON.
                                Ready for POC 2 (Custom Slide Extension).
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
