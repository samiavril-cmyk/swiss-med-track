import React from 'react';
import { Header } from '@/components/Header';
import { HeroSection } from '@/components/HeroSection';
import { InteractiveProgressDemo } from '@/components/InteractiveProgressDemo';

const Index = () => {
  console.log('Index: Rendering main content - NO AUTH DEPENDENCIES');
  
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <InteractiveProgressDemo />
      </main>
    </div>
  );
};

export default Index;