import React from 'react';
import { Header } from '@/components/Header';
import PublicationsShowcase from '@/components/PublicationsShowcase';

const Publications: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-card-foreground mb-4">
              Publikationen & Forschung
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Übersicht meiner wissenschaftlichen Publikationen und laufenden Forschungsprojekte 
              in der Ophthalmologie und Chirurgie.
            </p>
          </div>
          
          <PublicationsShowcase />
        </div>
      </main>
    </div>
  );
};

export default Publications;
