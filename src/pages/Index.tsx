import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { InteractiveProgressDemo } from '@/components/InteractiveProgressDemo';
import { useAuth } from '@/hooks/useAuth';

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  console.log('Index page rendering - user:', user, 'loading:', loading);

  useEffect(() => {
    if (!loading && user) {
      console.log('Redirecting authenticated user to FMH dashboard');
      navigate("/fmh");
    }
  }, [user, loading, navigate]);

  if (loading) {
    console.log('Showing loading state');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="ml-4 text-text-secondary">Loading...</p>
      </div>
    );
  }

  console.log('Rendering main content');
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <div className="container mx-auto px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-card-foreground mb-4">
              ResidentTrack
            </h1>
            <p className="text-xl text-text-secondary mb-8">
              FMH-konforme Ausbildungsdokumentation
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => navigate('/auth')}
                className="bg-primary text-primary-foreground px-6 py-3 rounded-medical font-medium hover:bg-primary-hover transition-smooth"
              >
                Anmelden
              </button>
              <button 
                onClick={() => navigate('/fmh')}
                className="bg-secondary text-secondary-foreground px-6 py-3 rounded-medical font-medium hover:bg-secondary-hover transition-smooth"
              >
                Demo ansehen
              </button>
            </div>
          </div>
        </div>
        {/* Temporarily comment out complex components */}
        {/* <HeroSection />
        <InteractiveProgressDemo /> */}
      </main>
    </div>
  );
};

export default Index;