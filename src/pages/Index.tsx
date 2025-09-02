import React from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { InteractiveProgressDemo } from '@/components/InteractiveProgressDemo';
import { VerticalCourseTimeline, mockCourses2024 } from '@/components/VerticalCourseTimeline';

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
            
            {/* Residents Community Section */}
            <section className="py-16 bg-gradient-to-br from-slate-50 to-slate-100">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Text Content */}
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-3xl font-bold text-card-foreground mb-4">
                        Werden Sie Teil unserer
                        <span className="bg-gradient-medical bg-clip-text text-transparent"> Resident-Community</span>
                      </h2>
                      <p className="text-lg text-muted-foreground mb-6">
                        Schließen Sie sich über 500 Assistenzärzt:innen an, die bereits ihre chirurgische 
                        Ausbildung mit ResidentTrack digital verwalten und dokumentieren.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-primary mb-1">500+</div>
                        <div className="text-sm text-muted-foreground">Aktive Residents</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-primary mb-1">15+</div>
                        <div className="text-sm text-muted-foreground">Krankenhäuser</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-primary mb-1">1000+</div>
                        <div className="text-sm text-muted-foreground">Dokumentierte Prozeduren</div>
                      </div>
                      <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                        <div className="text-2xl font-bold text-primary mb-1">95%</div>
                        <div className="text-sm text-muted-foreground">Zufriedenheitsrate</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                        Jetzt beitreten
                      </button>
                      <button className="border border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary/10 transition-colors">
                        Mehr erfahren
                      </button>
                    </div>
                  </div>
                  
                  {/* Image Content - Clean Design */}
                  <div className="relative">
                    <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                      <img 
                        src="/residents-image-2.png" 
                        alt="Resident Community - Chirurgische Ausbildung"
                        className="w-full h-auto object-cover"
                        style={{ minHeight: '500px' }}
                      />
                    </div>
                    
                    {/* Background decoration */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl -z-10 transform rotate-3 scale-105"></div>
                  </div>
                </div>
              </div>
            </section>

            {/* Course Timeline Example */}
            <section className="py-16 bg-gray-50">
              <div className="container mx-auto px-4">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold text-card-foreground mb-4">
                    Kurs-Timeline Beispiel
                  </h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Verfolgen Sie Ihre Fortbildung mit unserer professionellen Timeline-Darstellung. 
                    Pflichtkurse werden hervorgehoben und der Fortschritt wird visuell dargestellt.
                  </p>
                </div>
                <div className="max-w-4xl mx-auto">
                  <VerticalCourseTimeline courses={mockCourses2024} year={2024} />
                </div>
              </div>
            </section>
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