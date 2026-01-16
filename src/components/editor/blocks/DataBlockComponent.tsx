import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { PerformanceBlock } from './PerformanceBlock';
import { ChartBlock } from './ChartBlock';
import { KeyMetricsBlock } from './KeyMetricsBlock';
import type { DataBlockAttributes } from '../extensions/DataBlockExtension';

interface DataBlockComponentProps {
    node: {
        attrs: DataBlockAttributes;
    };
    updateAttributes: (attrs: Partial<DataBlockAttributes>) => void;
    deleteNode: () => void;
    selected: boolean;
}

/**
 * Data Block Component (Epic 13 - Story 13.2)
 * 
 * React component that renders different types of data blocks
 * based on the blockType attribute.
 */
export const DataBlockComponent: React.FC<DataBlockComponentProps> = ({
    node,
    updateAttributes,
    deleteNode,
    selected,
}) => {
    const { blockType, config } = node.attrs;

    const renderBlock = () => {
        switch (blockType) {
            case 'performance':
                return <PerformanceBlock config={config} />;
            case 'chart':
                return <ChartBlock config={config} />;
            case 'keyMetrics':
                return <KeyMetricsBlock config={config} />;
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
                {/* Block content */}
                {renderBlock()}

                {/* Toolbar (visible on hover/select) */}
                {selected && (
                    <div className="absolute top-2 right-2 flex gap-2 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-2 border border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => {
                                // TODO: Open settings modal
                                console.log('Configure block:', blockType);
                            }}
                            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                            title="Configure"
                        >
                            ⚙️ Settings
                        </button>
                        <button
                            onClick={deleteNode}
                            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition"
                            title="Delete"
                        >
                            🗑️ Delete
                        </button>
                    </div>
                )}
            </div>
        </NodeViewWrapper>
    );
};
