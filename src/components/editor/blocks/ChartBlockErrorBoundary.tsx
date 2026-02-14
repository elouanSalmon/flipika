import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface ChartBlockErrorBoundaryProps {
    children: ReactNode;
    blockType: string;
}

interface ChartBlockErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary for Chart Blocks
 * 
 * Catches rendering errors in chart components to prevent
 * the entire editor from crashing. Displays a fallback UI
 * with error details for debugging.
 */
export class ChartBlockErrorBoundary extends Component<
    ChartBlockErrorBoundaryProps,
    ChartBlockErrorBoundaryState
> {
    constructor(props: ChartBlockErrorBoundaryProps) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
        };
    }

    static getDerivedStateFromError(error: Error): ChartBlockErrorBoundaryState {
        return {
            hasError: true,
            error,
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('[ChartBlockErrorBoundary] Caught error:', {
            blockType: this.props.blockType,
            error,
            errorInfo,
            componentStack: errorInfo.componentStack,
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    className="chart-block-error"
                    style={{
                        padding: '2rem',
                        borderRadius: '0.5rem',
                        border: '2px dashed #ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.05)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.75rem',
                        minHeight: '200px',
                    }}
                >
                    <AlertTriangle size={32} color="#ef4444" />
                    <div style={{ textAlign: 'center' }}>
                        <h4
                            style={{
                                margin: '0 0 0.5rem 0',
                                fontSize: '1rem',
                                fontWeight: 600,
                                color: '#ef4444',
                            }}
                        >
                            Erreur de rendu du bloc graphique
                        </h4>
                        <p
                            style={{
                                margin: '0 0 0.5rem 0',
                                fontSize: '0.875rem',
                                color: '#6b6e77',
                            }}
                        >
                            Type de bloc : <code>{this.props.blockType}</code>
                        </p>
                        {this.state.error && (
                            <details
                                style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                    borderRadius: '0.375rem',
                                    fontSize: '0.75rem',
                                    textAlign: 'left',
                                    maxWidth: '500px',
                                }}
                            >
                                <summary
                                    style={{
                                        cursor: 'pointer',
                                        fontWeight: 500,
                                        color: '#1a1a1a',
                                        marginBottom: '0.5rem',
                                    }}
                                >
                                    Détails de l'erreur
                                </summary>
                                <pre
                                    style={{
                                        margin: '0',
                                        overflow: 'auto',
                                        fontSize: '0.75rem',
                                        color: '#545660',
                                        whiteSpace: 'pre-wrap',
                                        wordBreak: 'break-word',
                                    }}
                                >
                                    {this.state.error.message}
                                    {'\n\n'}
                                    {this.state.error.stack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
