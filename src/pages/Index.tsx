import React from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { InteractiveProgressDemo } from '@/components/InteractiveProgressDemo';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Index Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Fehler beim Laden der Seite</h1>
            <p className="text-red-600 mb-4">Ein unerwarteter Fehler ist aufgetreten.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Seite neu laden
            </button>
            <details className="mt-4 text-left">
              <summary className="cursor-pointer text-red-700">Fehlerdetails</summary>
              <pre className="mt-2 text-xs text-red-600 bg-red-100 p-2 rounded overflow-auto">
                {this.state.error?.toString()}
              </pre>
            </details>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const Index = () => {
  console.log('Index: Rendering main content - NO AUTH DEPENDENCIES');
  
  // Test if components can render
  try {
    return (
      <ErrorBoundary>
        <div className="min-h-screen bg-background">
          <Header />
          <main>
            <HeroSection />
            <InteractiveProgressDemo />
          </main>
        </div>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Index render error:', error);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">Render-Fehler</h1>
          <p className="text-red-600">{String(error)}</p>
        </div>
      </div>
    );
  }
};

export default Index;