import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex min-h-[60vh] flex-col items-center justify-center p-6 text-center">
                    <div className="rounded-full bg-red-100 p-4 text-red-600">
                        <AlertTriangle className="h-10 w-10" />
                    </div>
                    <h2 className="mt-4 text-2xl font-bold text-slate-800">Something went wrong</h2>
                    <p className="mt-2 max-w-md text-sm text-slate-600">
                        {this.state.error?.message || 'An unexpected rendering error occurred in this section.'}
                    </p>
                    <button
                        onClick={this.handleReload}
                        className="mt-6 inline-flex items-center space-x-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 transition"
                    >
                        <RefreshCw className="h-4 w-4" />
                        <span>Reload Page</span>
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
