/**
 * useGenerateAnalysis Hook
 *
 * Manages AI-powered narrative generation for data blocks.
 * Supports both individual block analysis and bulk generation.
 *
 * Features:
 * - Individual block analysis with loading state
 * - Bulk analysis with concurrent request limiting (max 3)
 * - Config hash tracking for stale description detection
 * - Error handling per block
 */

import { useState, useCallback, useRef } from 'react';
import { generateBlockAnalysis } from '../services/aiService';
import type { FlexibleDataConfig } from '../components/editor/blocks/FlexibleDataBlock';

// Concurrency limit for bulk generation
const MAX_CONCURRENT_REQUESTS = 3;

export interface BlockAnalysisInput {
    blockId: string;
    config: FlexibleDataConfig;
    currentData: Array<Record<string, number | string>>;
    comparisonData?: Array<Record<string, number | string>>;
    period: { start: string; end: string };
}

export interface GenerationState {
    isGenerating: boolean;
    error: string | null;
}

export interface BulkGenerationProgress {
    total: number;
    completed: number;
    failed: number;
    inProgress: string[]; // Block IDs currently being processed
}

/**
 * Generates a hash from the block configuration and period
 * Used to detect when the description might be stale
 */
export function generateConfigHash(
    config: FlexibleDataConfig,
    startDate?: Date | string,
    endDate?: Date | string
): string {
    const hashInput = {
        metrics: config.metrics?.sort() || [],
        dimension: config.dimension || '',
        visualization: config.visualization || '',
        showComparison: config.showComparison || false,
        comparisonType: config.comparisonType || '',
        startDate: startDate ? new Date(startDate).toISOString().split('T')[0] : '',
        endDate: endDate ? new Date(endDate).toISOString().split('T')[0] : '',
    };

    // Simple hash function for the configuration
    const str = JSON.stringify(hashInput);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
}

/**
 * Check if the description is potentially stale
 * (config has changed since the analysis was generated)
 */
export function isDescriptionStale(
    config: FlexibleDataConfig,
    startDate?: Date | string,
    endDate?: Date | string
): boolean {
    if (!config.description || !config.aiAnalysisHash) {
        return false; // No description to be stale
    }

    const currentHash = generateConfigHash(config, startDate, endDate);
    return currentHash !== config.aiAnalysisHash;
}

export function useGenerateAnalysis() {
    // Track generation state per block
    const [generationStates, setGenerationStates] = useState<Record<string, GenerationState>>({});

    // Track bulk generation progress
    const [bulkProgress, setBulkProgress] = useState<BulkGenerationProgress | null>(null);

    // Abort controller for cancelling bulk operations
    const abortControllerRef = useRef<AbortController | null>(null);

    /**
     * Generate analysis for a single block
     */
    const generateForBlock = useCallback(async (
        input: BlockAnalysisInput,
        onSuccess: (description: string, hash: string) => void
    ): Promise<boolean> => {
        const { blockId, config, currentData, comparisonData, period } = input;

        // Set loading state
        setGenerationStates(prev => ({
            ...prev,
            [blockId]: { isGenerating: true, error: null }
        }));

        try {
            const result = await generateBlockAnalysis({
                blockTitle: config.title || 'Data Block',
                visualization: config.visualization,
                metrics: config.metrics,
                dimension: config.dimension,
                period,
                currentData,
                comparisonData,
                showComparison: config.showComparison,
            });

            // Generate hash for staleness detection
            const hash = generateConfigHash(config, period.start, period.end);

            // Call success callback with result
            onSuccess(result.analysis, hash);

            // Clear loading state
            setGenerationStates(prev => ({
                ...prev,
                [blockId]: { isGenerating: false, error: null }
            }));

            return true;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to generate analysis';

            setGenerationStates(prev => ({
                ...prev,
                [blockId]: { isGenerating: false, error: errorMessage }
            }));

            return false;
        }
    }, []);

    /**
     * Generate analyses for multiple blocks with concurrency limiting
     */
    const generateForAllBlocks = useCallback(async (
        inputs: BlockAnalysisInput[],
        onBlockSuccess: (blockId: string, description: string, hash: string) => void,
        options?: { onlyEmpty?: boolean }
    ): Promise<void> => {
        // Filter to only blocks without descriptions if requested
        const blocksToProcess = options?.onlyEmpty
            ? inputs.filter(input => !input.config.description)
            : inputs;

        if (blocksToProcess.length === 0) {
            return;
        }

        // Create abort controller
        abortControllerRef.current = new AbortController();

        // Initialize progress
        setBulkProgress({
            total: blocksToProcess.length,
            completed: 0,
            failed: 0,
            inProgress: []
        });

        // Process blocks with concurrency limit
        const queue = [...blocksToProcess];
        const activePromises: Promise<void>[] = [];

        const processNext = async (): Promise<void> => {
            if (abortControllerRef.current?.signal.aborted) {
                return;
            }

            const input = queue.shift();
            if (!input) {
                return;
            }

            // Update progress - add to inProgress
            setBulkProgress(prev => prev ? {
                ...prev,
                inProgress: [...prev.inProgress, input.blockId]
            } : null);

            const success = await generateForBlock(input, (description, hash) => {
                onBlockSuccess(input.blockId, description, hash);
            });

            // Update progress - remove from inProgress, increment counters
            setBulkProgress(prev => prev ? {
                ...prev,
                completed: prev.completed + (success ? 1 : 0),
                failed: prev.failed + (success ? 0 : 1),
                inProgress: prev.inProgress.filter(id => id !== input.blockId)
            } : null);

            // Process next item
            await processNext();
        };

        // Start initial batch of concurrent requests
        for (let i = 0; i < Math.min(MAX_CONCURRENT_REQUESTS, blocksToProcess.length); i++) {
            activePromises.push(processNext());
        }

        // Wait for all to complete
        await Promise.all(activePromises);

        // Clear bulk progress after a delay
        setTimeout(() => {
            setBulkProgress(null);
        }, 2000);
    }, [generateForBlock]);

    /**
     * Cancel ongoing bulk generation
     */
    const cancelBulkGeneration = useCallback(() => {
        abortControllerRef.current?.abort();
        setBulkProgress(null);
        setGenerationStates({});
    }, []);

    /**
     * Get generation state for a specific block
     */
    const getBlockState = useCallback((blockId: string): GenerationState => {
        return generationStates[blockId] || { isGenerating: false, error: null };
    }, [generationStates]);

    /**
     * Clear error for a specific block
     */
    const clearBlockError = useCallback((blockId: string) => {
        setGenerationStates(prev => ({
            ...prev,
            [blockId]: { ...prev[blockId], error: null }
        }));
    }, []);

    return {
        generateForBlock,
        generateForAllBlocks,
        cancelBulkGeneration,
        getBlockState,
        clearBlockError,
        bulkProgress,
        isGenerating: Object.values(generationStates).some(s => s.isGenerating) || !!bulkProgress,
    };
}

export default useGenerateAnalysis;
