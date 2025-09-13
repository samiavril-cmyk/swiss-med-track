import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
  isOnline: boolean;
}

class AuthErrorBoundary extends Component<Props, State> {
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0,
      isOnline: navigator.onLine
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AuthErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  componentDidMount() {
    // Listen for online/offline events
    window.addEventListener('online', this.handleOnline);
    window.addEventListener('offline', this.handleOffline);
  }

  componentWillUnmount() {
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  handleOnline = () => {
    console.log('[AuthErrorBoundary] Back online');
    this.setState({ isOnline: true });
    // Auto-retry when back online
    this.handleRetry();
  };

  handleOffline = () => {
    console.log('[AuthErrorBoundary] Gone offline');
    this.setState({ isOnline: false });
  };

  handleRetry = () => {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }

    this.setState(prevState => ({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1
    }));

    // Force a page reload to reset all state
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: 0
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { error, retryCount, isOnline } = this.state;
      const isAuthError = error?.message?.includes('auth') || 
                         error?.message?.includes('session') ||
                         error?.message?.includes('profile');

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">
                {isAuthError ? 'Authentifizierungsfehler' : 'Anwendungsfehler'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                {isOnline ? (
                  <Wifi className="h-4 w-4 text-green-500" />
                ) : (
                  <WifiOff className="h-4 w-4 text-red-500" />
                )}
                <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                {isAuthError 
                  ? 'Es gab ein Problem mit der Anmeldung. Bitte versuchen Sie es erneut.'
                  : 'Die Anwendung ist auf einen unerwarteten Fehler gestoßen.'
                }
              </p>

              {retryCount > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Wiederholungsversuch {retryCount} von 3
                  </AlertDescription>
                </Alert>
              )}

              {process.env.NODE_ENV === 'development' && error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Fehlerdetails (Development)
                  </summary>
                  <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
                    {error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex gap-2 justify-center">
                <Button 
                  onClick={this.handleRetry} 
                  variant="outline"
                  disabled={!isOnline}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  {isOnline ? 'Erneut versuchen' : 'Warten auf Verbindung...'}
                </Button>
                <Button onClick={() => window.location.reload()}>
                  Seite neu laden
                </Button>
              </div>

              {retryCount >= 3 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Mehrere Wiederholungsversuche fehlgeschlagen. 
                    Bitte überprüfen Sie Ihre Internetverbindung oder kontaktieren Sie den Support.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AuthErrorBoundary;
