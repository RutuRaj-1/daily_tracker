// src/components/common/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ 
      error: error, 
      errorInfo: errorInfo 
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI when there's an error
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-8 text-center">
            <div className="w-20 h-20 bg-rose-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg 
                className="w-10 h-10 text-rose-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
                />
              </svg>
            </div>
            
            <h2 className="text-2xl font-light text-slate-700 mb-2">
              Something went wrong
            </h2>
            
            <p className="text-slate-500 mb-6">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-gradient-to-r from-indigo-400 to-violet-400 text-white rounded-lg hover:from-indigo-500 hover:to-violet-500 transition-all shadow-sm hover:shadow-md"
              >
                Refresh Page
              </button>
              
              <a
                href="/dashboard"
                className="px-6 py-2 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Go Home
              </a>
            </div>

            {/* Show error details in development only */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="mt-6 p-4 bg-slate-50 rounded-xl text-left">
                <p className="text-sm font-mono text-rose-600 mb-2">
                  {this.state.error.toString()}
                </p>
                <details className="text-xs text-slate-500">
                  <summary className="cursor-pointer mb-2">Stack trace</summary>
                  <pre className="overflow-auto max-h-40 p-2 bg-slate-100 rounded">
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              </div>
            )}
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;