import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error to your error reporting service
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
    
    // Reload the page to reset the app state
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1e1e1e] text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-6 text-center">
            <div className="flex flex-col items-center gap-4">
              <AlertTriangle className="h-12 w-12 text-red-500" />
              <h1 className="text-xl font-semibold">Something went wrong</h1>
              <p className="text-white/70">
                We apologize for the inconvenience. The error has been logged and we'll look into it.
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-4 text-left">
                  <details className="bg-white/5 rounded-lg p-4 text-sm">
                    <summary className="cursor-pointer text-white/60 hover:text-white/80">
                      Error Details
                    </summary>
                    <pre className="mt-2 text-xs text-white/60 overflow-auto">
                      {this.state.error.toString()}
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                </div>
              )}
              <Button 
                onClick={this.handleReset}
                size="lg"
                className="mt-4"
              >
                Try Again
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}