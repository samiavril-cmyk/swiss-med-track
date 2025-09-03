import React from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { InteractiveProgressDemo } from '@/components/InteractiveProgressDemo';
import { VerticalCourseTimeline, mockCourses2024 } from '@/components/VerticalCourseTimeline';
import AnimatedSection, { StaggeredContainer } from '@/components/AnimatedSection';

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
            <section className="py-20 bg-white relative overflow-hidden">
              
              <div className="container mx-auto px-4 relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  {/* Text Content */}
                  <AnimatedSection animation="slideRight" delay={0}>
                    <div className="space-y-8">
                      <div>
                        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          Community
                        </div>
                        <h2 className="text-4xl font-bold text-slate-900 mb-6 leading-tight">
                          Werden Sie Teil unserer
                          <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent"> Resident-Community</span>
                        </h2>
                        <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                          Schließen Sie sich über 500 Assistenzärzt:innen an, die bereits ihre chirurgische 
                          Ausbildung mit ResidentTrack digital verwalten und dokumentieren.
                        </p>
                      </div>
                    
                      <StaggeredContainer staggerDelay={150} animation="slideUp">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="group">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-all duration-300">
                              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                              <div className="text-sm text-slate-600 font-medium">Aktive Residents</div>
                            </div>
                          </div>
                          <div className="group">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-all duration-300">
                              <div className="text-3xl font-bold text-green-600 mb-2">15+</div>
                              <div className="text-sm text-slate-600 font-medium">Krankenhäuser</div>
                            </div>
                          </div>
                          <div className="group">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-all duration-300">
                              <div className="text-3xl font-bold text-purple-600 mb-2">1000+</div>
                              <div className="text-sm text-slate-600 font-medium">Dokumentierte Prozeduren</div>
                            </div>
                          </div>
                          <div className="group">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-all duration-300">
                              <div className="text-3xl font-bold text-orange-600 mb-2">95%</div>
                              <div className="text-sm text-slate-600 font-medium">Zufriedenheitsrate</div>
                            </div>
                          </div>
                        </div>
                      </StaggeredContainer>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                      <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl">
                        Jetzt beitreten
                      </button>
                      <button className="border-2 border-slate-200 text-slate-700 px-8 py-4 rounded-xl font-semibold hover:border-slate-300 hover:bg-slate-50 transition-all duration-300">
                        Mehr erfahren
                      </button>
                      </div>
                    </div>
                  </AnimatedSection>
                  
                  {/* Seamless Image Integration */}
                  <AnimatedSection animation="slideLeft" delay={200}>
                    <div className="relative">
                      <img 
                        src="https://samiavril-cmyk.github.io/swiss-med-track/residents-image-2.png" 
                        alt="Resident Community - Chirurgische Ausbildung"
                        className="w-full h-auto object-cover"
                        style={{ minHeight: '500px' }}
                      />
                    </div>
                  </AnimatedSection>
                </div>
              </div>
            </section>

            {/* Dashboard Preview Section */}
            <section className="py-20 bg-white relative overflow-hidden">
              
              <div className="container mx-auto px-4 relative">
                <AnimatedSection animation="fadeIn" delay={0}>
                  <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-slate-50 text-slate-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      Dashboard
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 mb-6">
                      Ihr persönliches Dashboard
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                      Verfolgen Sie Ihren Fortschritt mit unserem intuitiven Dashboard. 
                      Alle wichtigen Metriken auf einen Blick.
                    </p>
                  </div>
                </AnimatedSection>
                
                <AnimatedSection animation="scaleIn" delay={300}>
                  <div className="max-w-7xl mx-auto">
                    <img
                      src="https://samiavril-cmyk.github.io/swiss-med-track/dashboard.png"
                      alt="ResidentTrack Dashboard - Übersicht der chirurgischen Ausbildung"
                      className="w-full h-auto object-cover"
                    />
                  </div>
                </AnimatedSection>
              </div>
            </section>

            {/* Course Timeline Example */}
            <section className="py-16 bg-white">
              <div className="container mx-auto px-4">
                <AnimatedSection animation="fadeIn" delay={0}>
                  <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-card-foreground mb-4">
                      Kurs-Timeline Beispiel
                    </h2>
                    <p className="text-muted-foreground max-w-2xl mx-auto">
                      Verfolgen Sie Ihre Fortbildung mit unserer professionellen Timeline-Darstellung. 
                      Pflichtkurse werden hervorgehoben und der Fortschritt wird visuell dargestellt.
                    </p>
                  </div>
                </AnimatedSection>
                <AnimatedSection animation="slideUp" delay={200}>
                  <div className="max-w-4xl mx-auto">
                    <VerticalCourseTimeline courses={mockCourses2024} year={2024} />
                  </div>
                </AnimatedSection>
              </div>
            </section>

            {/* Awards & Recognition Section */}
            <section className="py-20 bg-white relative overflow-hidden">
              
              <div className="container mx-auto px-4 relative">
                <AnimatedSection animation="fadeIn" delay={0}>
                  <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                      <span className="text-amber-600">🏆</span>
                      Auszeichnungen
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 mb-6">
                      Auszeichnungen & Anerkennung
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                      Ihre Erfolge und Errungenschaften in der chirurgischen Ausbildung
                    </p>
                  </div>
                </AnimatedSection>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <AnimatedSection animation="slideRight" delay={200}>
                    <div className="space-y-8">
                      <div className="space-y-6">
                        <h3 className="text-3xl font-bold text-slate-900">
                          Exzellenz in der Ausbildung
                        </h3>
                        <p className="text-lg text-slate-600 leading-relaxed">
                          Ihre herausragenden Leistungen und Anerkennungen spiegeln Ihr Engagement 
                          für die chirurgische Ausbildung wider.
                        </p>
                      </div>
                    
                      <StaggeredContainer staggerDelay={150} animation="slideUp">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="group">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-all duration-300">
                              <div className="text-3xl font-bold text-amber-600 mb-2">5+</div>
                              <div className="text-sm text-slate-600 font-medium">Auszeichnungen</div>
                            </div>
                          </div>
                          <div className="group">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-all duration-300">
                              <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
                              <div className="text-sm text-slate-600 font-medium">Erfolgsrate</div>
                            </div>
                          </div>
                        </div>
                      </StaggeredContainer>
                    </div>
                  </AnimatedSection>
                  
                  {/* Seamless Image Integration */}
                  <AnimatedSection animation="slideLeft" delay={400}>
                    <div className="relative">
                      <img
                        src="https://samiavril-cmyk.github.io/swiss-med-track/awardsresidents2-image.png"
                        alt="Awards & Recognition - Chirurgische Ausbildung"
                        className="w-full h-auto object-cover"
                        style={{ minHeight: '400px' }}
                      />
                    </div>
                  </AnimatedSection>
                </div>
              </div>
            </section>

            {/* Course Excellence Section */}
            <section className="py-20 bg-white relative overflow-hidden">
              
              <div className="container mx-auto px-4 relative">
                <AnimatedSection animation="fadeIn" delay={0}>
                  <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                      <span className="text-blue-600">📚</span>
                      Kurse
                    </div>
                    <h2 className="text-4xl font-bold text-slate-900 mb-6">
                      Kurs-Exzellenz
                    </h2>
                    <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                      Ihre Teilnahme an hochwertigen Kursen und Weiterbildungen
                    </p>
                  </div>
                </AnimatedSection>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <AnimatedSection animation="slideRight" delay={200}>
                    <div className="relative order-2 lg:order-1">
                      <img
                        src="https://samiavril-cmyk.github.io/swiss-med-track/courseresidentsimage.png"
                        alt="Course Excellence - Chirurgische Ausbildung"
                        className="w-full h-auto object-cover"
                        style={{ minHeight: '400px' }}
                      />
                    </div>
                  </AnimatedSection>
                  
                  <AnimatedSection animation="slideLeft" delay={400}>
                    <div className="space-y-8 order-1 lg:order-2">
                      <div className="space-y-6">
                        <h3 className="text-3xl font-bold text-slate-900">
                          Kontinuierliche Weiterbildung
                        </h3>
                        <p className="text-lg text-slate-600 leading-relaxed">
                          Ihre aktive Teilnahme an Kursen und Weiterbildungen zeigt Ihr 
                          Engagement für lebenslanges Lernen in der Chirurgie.
                        </p>
                      </div>
                    
                      <StaggeredContainer staggerDelay={150} animation="slideUp">
                        <div className="grid grid-cols-2 gap-6">
                          <div className="group">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-all duration-300">
                              <div className="text-3xl font-bold text-blue-600 mb-2">15+</div>
                              <div className="text-sm text-slate-600 font-medium">Kurse</div>
                            </div>
                          </div>
                          <div className="group">
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-all duration-300">
                              <div className="text-3xl font-bold text-cyan-600 mb-2">120+</div>
                              <div className="text-sm text-slate-600 font-medium">CME Punkte</div>
                            </div>
                          </div>
                        </div>
                      </StaggeredContainer>
                    </div>
                  </AnimatedSection>
                </div>
              </div>
            </section>

            {/* Training Excellence Section */}
            <section className="py-20 bg-gradient-to-br from-teal-50 via-emerald-50 to-green-50 relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(20,184,166,0.1),transparent_50%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.1),transparent_50%)]"></div>
              
              <div className="container mx-auto px-4 relative">
                <div className="text-center mb-16">
                  <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                    <span className="text-teal-600">⚕️</span>
                    Training
                  </div>
                  <h2 className="text-4xl font-bold text-slate-900 mb-6">
                    Trainings-Exzellenz
                  </h2>
                  <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
                    Ihre praktische Ausbildung und operative Erfahrung
                  </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                  <div className="space-y-8">
                    <div className="space-y-6">
                      <h3 className="text-3xl font-bold text-slate-900">
                        Praktische Ausbildung
                      </h3>
                      <p className="text-lg text-slate-600 leading-relaxed">
                        Ihre operative Erfahrung und praktische Ausbildung bilden das 
                        Fundament Ihrer chirurgischen Kompetenz.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="group">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-all duration-300">
                          <div className="text-3xl font-bold text-teal-600 mb-2">500+</div>
                          <div className="text-sm text-slate-600 font-medium">Operationen</div>
                        </div>
                      </div>
                      <div className="group">
                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white/20 hover:shadow-md transition-all duration-300">
                          <div className="text-3xl font-bold text-emerald-600 mb-2">6</div>
                          <div className="text-sm text-slate-600 font-medium">Jahre</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Modern Image Integration */}
                  <div className="relative">
                    <div className="relative group">
                      {/* Image with modern styling */}
                      <div className="relative overflow-hidden rounded-3xl shadow-2xl">
                        <img
                          src="https://samiavril-cmyk.github.io/swiss-med-track/trainingimage.png"
                          alt="Training Excellence - Chirurgische Ausbildung"
                          className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                          style={{ minHeight: '400px' }}
                        />
                        {/* Overlay gradient */}
                        <div className="absolute inset-0 bg-gradient-to-t from-teal-900/20 via-transparent to-transparent"></div>
                      </div>
                      
                      {/* Floating Training Badges */}
                      <div className="absolute -top-6 -left-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="text-teal-600 text-lg">⚕️</span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">500+ OPs</div>
                            <div className="text-xs text-slate-600">Erfahrung</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="absolute -bottom-6 -right-6 bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border border-white/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-emerald-600 text-lg">🎯</span>
                          </div>
                          <div>
                            <div className="font-bold text-slate-800">6 Jahre</div>
                            <div className="text-xs text-slate-600">Ausbildung</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
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