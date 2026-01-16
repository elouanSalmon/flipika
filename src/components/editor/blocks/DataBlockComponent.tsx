import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { Settings, Trash2 } from 'lucide-react';
import { PerformanceBlock } from './PerformanceBlock';
import { ChartBlock } from './ChartBlock';
import { KeyMetricsBlock } from './KeyMetricsBlock';

/**
 * Data Block Component (Epic 13 - Story 13.2)
 */
export const DataBlockComponent = ({ node, deleteNode, selected }: NodeViewProps) => {
    const { blockType, config } = node.attrs;

    const renderBlock = () => {
        switch (blockType) {
            case 'performance':
                return <PerformanceBlock config={config || {}} />;
            case 'chart':
                return <ChartBlock config={config || {}} />;
            case 'keyMetrics':
                return <KeyMetricsBlock config={config || {}} />;
            default:
                return (
                    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
                        <p className="text-gray-600 dark:text-gray-400">
                            Unknown block type: {blockType}
                        </p>
                    </div>
                );
        }
    };

    return (
        <NodeViewWrapper
            className={`data-block-wrapper ${selected ? 'selected' : ''}`}
            data-block-type={blockType}
        >
            <div className="relative group">
                {renderBlock()}

                {selected && (
                    <div className="data-block-actions">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                console.log('Configure block:', blockType);
                            }}
                            className="data-block-action-btn"
                            title="Configure"
                        >
                            <Settings size={16} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteNode();
                            }}
                            className="data-block-action-btn danger"
                            title="Delete"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
};
