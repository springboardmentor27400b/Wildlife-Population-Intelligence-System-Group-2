import React, { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center bg-white dark:bg-forest-900 border border-red-200 rounded-xl max-w-xl mx-auto my-12 shadow-sm">
          <h2 className="text-xl font-bold font-outfit text-rose-600 mb-2">Something went wrong</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            {this.state.error?.message || 'An unexpected rendering error occurred.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Reload Platform
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
