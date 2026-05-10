import React from 'react';

interface Props {
    children: React.ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', fontFamily: 'monospace' }}>
                    <h1 style={{ color: 'red' }}>Something went wrong!</h1>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        <summary>Error Details</summary>
                        <p>{this.state.error?.toString()}</p>
                        <p>{this.state.error?.stack}</p>
                    </details>
                </div>
            );
        }

        return this.props.children;
    }
}
