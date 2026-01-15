import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from '@tiptap/react';

/**
 * React Component for Slide NodeView
 * 
 * Affiche une slide dans l'éditeur TipTap avec:
 * - Type de slide sélectionnable
 * - Contenu éditable
 * - Données de la slide affichées
 */

const SLIDE_TYPES = [
    { value: 'performance', label: '📊 Performance', color: 'blue' },
    { value: 'chart', label: '📈 Chart', color: 'green' },
    { value: 'metrics', label: '📉 Metrics', color: 'purple' },
    { value: 'creative', label: '🎨 Creative', color: 'pink' },
] as const;

export const SlideComponent = ({ node, updateAttributes, deleteNode }: NodeViewProps) => {
    const { slideType, slideData } = node.attrs;

    const currentSlideType = SLIDE_TYPES.find(t => t.value === slideType) || SLIDE_TYPES[0];

    return (
        <NodeViewWrapper className="slide-wrapper my-6">
            <div
                className={`border-2 border-${currentSlideType.color}-500 rounded-lg overflow-hidden bg-white shadow-lg`}
                data-drag-handle
            >
                {/* Slide Header */}
                <div className={`bg-${currentSlideType.color}-50 border-b border-${currentSlideType.color}-200 px-4 py-3`}>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className="text-lg">📄</span>
                            <select
                                value={slideType}
                                onChange={(e) => updateAttributes({ slideType: e.target.value })}
                                className="text-sm font-semibold border rounded px-3 py-1 bg-white"
                                contentEditable={false}
                            >
                                {SLIDE_TYPES.map(type => (
                                    <option key={type.value} value={type.value}>
                                        {type.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button
                                onClick={() => {
                                    const title = prompt('Titre de la slide:', slideData.title || '');
                                    if (title !== null) {
                                        updateAttributes({
                                            slideData: { ...slideData, title }
                                        });
                                    }
                                }}
                                className="text-xs bg-white border rounded px-2 py-1 hover:bg-gray-50"
                                contentEditable={false}
                            >
                                ✏️ Edit Data
                            </button>
                            <button
                                onClick={deleteNode}
                                className="text-xs bg-red-50 text-red-600 border border-red-200 rounded px-2 py-1 hover:bg-red-100"
                                contentEditable={false}
                            >
                                🗑️ Delete
                            </button>
                        </div>
                    </div>
                </div>

                {/* Slide Content (Editable) */}
                <div className="p-6 bg-white">
                    <NodeViewContent className="slide-content prose max-w-none" />
                </div>

                {/* Slide Data Display */}
                {Object.keys(slideData).length > 0 && (
                    <div className="bg-gray-50 border-t px-4 py-3">
                        <p className="text-xs font-semibold text-gray-600 mb-1">Slide Data:</p>
                        <pre className="text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                            {JSON.stringify(slideData, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
};
