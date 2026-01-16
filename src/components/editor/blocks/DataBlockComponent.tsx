import React from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import { Settings, Trash2 } from 'lucide-react';
import { PerformanceBlock } from './PerformanceBlock';
import { ChartBlock } from './ChartBlock';
import { KeyMetricsBlock } from './KeyMetricsBlock';
import type { DataBlockAttributes } from '../extensions/DataBlockExtension';
import type { ReportDesign } from '../../../types/reportTypes';

interface DataBlockComponentProps {
    node: {
        attrs: DataBlockAttributes;
    };
    updateAttributes: (attrs: Partial<DataBlockAttributes>) => void;
    deleteNode: () => void;
    selected: boolean;
    extension: {
        storage: {
            design?: ReportDesign;
        };
    };
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
    extension,
}) => {
    const { blockType, config } = node.attrs;
    const design = extension?.storage?.design;

    const renderBlock = () => {
        switch (blockType) {
            case 'performance':
                return <PerformanceBlock config={config} design={design} />;
            case 'chart':
                return <ChartBlock config={config} design={design} />;
            case 'keyMetrics':
                return <KeyMetricsBlock config={config} design={design} />;
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

                {/* Toolbar (visible on select) - SlideItem inspired */}
                {selected && (
                    <div className="data-block-actions">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Open settings modal
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
