import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
    onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch and handle React component errors
 */
class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
        };
    }

    static getDerivedStateFromError(error: Error): Partial<State> {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
        this.setState({ errorInfo });

        // Log error for debugging
        console.error('ErrorBoundary caught an error:', error, errorInfo);

        // Call optional error callback
        this.props.onError?.(error, errorInfo);
    }

    handleRetry = (): void => {
        this.setState({
            hasError: false,
            error: null,
            errorInfo: null,
        });
    };

    handleGoHome = (): void => {
        window.location.href = '/app';
    };

    render(): ReactNode {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback;
            }

            // Default error UI
            return (
                <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
                    <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-full mb-4">
                        <AlertTriangle size={48} className="text-red-600 dark:text-red-400" />
                    </div>

                    <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-200 mb-2">
                        An error occurred
                    </h2>

                    <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md">
                        An unexpected problem occurred. Please try again or go back to home.
                    </p>

                    <div className="flex gap-3">
                        <button
                            onClick={this.handleRetry}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            <RefreshCw size={18} />
                            Retry
                        </button>

                        <button
                            onClick={this.handleGoHome}
                            className="flex items-center gap-2 px-4 py-2 border-2 border-neutral-300 dark:border-white/10 text-neutral-700 dark:text-neutral-300 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 transition-colors"
                        >
                            <Home size={18} />
                            Home
                        </button>
                    </div>

                    {/* Technical details (development only) */}
                    {import.meta.env.DEV && this.state.error && (
                        <details className="mt-6 w-full max-w-2xl text-left">
                            <summary className="cursor-pointer text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300">
                                Technical details
                            </summary>
                            <pre className="mt-2 p-4 bg-neutral-100 dark:bg-black rounded-lg text-xs text-red-600 dark:text-red-400 overflow-auto">
                                {this.state.error.toString()}
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
