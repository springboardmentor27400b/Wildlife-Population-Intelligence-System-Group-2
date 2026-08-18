import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught React Component Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-950/20 border border-red-900/40 rounded-2xl text-center space-y-3 my-4 max-w-xl mx-auto">
          <AlertTriangle size={32} className="text-red-400 mx-auto" />
          <h3 className="text-sm font-bold text-red-200 uppercase tracking-wider">Rendering Error Intercepted</h3>
          <p className="text-xs text-red-300 font-mono">
            {this.state.error?.message || "An unexpected error occurred while rendering this component."}
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-1.5 bg-red-900/50 hover:bg-red-800/50 text-red-200 rounded-lg text-xs font-semibold transition cursor-pointer inline-flex items-center space-x-1.5"
          >
            <RefreshCw size={12} />
            <span>Reset Component</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
