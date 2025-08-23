import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { InteractiveProgressDemo } from './InteractiveProgressDemo';
import { ArrowRight, CheckCircle, Users, BookOpen, Award } from 'lucide-react';

const features = [
  {
    icon: CheckCircle,
    title: 'FMH-konforme Dokumentation',
    description: 'Vollständige Prozeduren-Tracking nach FMH-Standards'
  },
  {
    icon: Users,
    title: 'Europaweite Kurssuche',
    description: 'Zugang zu Kursen in CH, DE, AT, FR, IT und mehr'
  },
  {
    icon: BookOpen,
    title: 'Digitales Logbuch',
    description: 'Automatische Portfolio-Erstellung und PDF-Export'
  },
  {
    icon: Award,
    title: 'Zertifikat-Management',
    description: 'CME-Punkte tracking und Zertifikat-Verwaltung'
  }
];

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden">
      {/* Hero Content */}
      <div className="hero-gradient">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto mb-16">
            {/* Badge */}
            <Badge variant="secondary" className="mb-6 text-sm px-4 py-2">
              🇨🇭 FMH-konforme Ausbildung für die Schweiz & Europa
            </Badge>
            
            {/* Main Headline */}
            <h1 className="text-medical-title text-card-foreground mb-6">
              Ihre chirurgische Ausbildung
              <span className="bg-gradient-medical bg-clip-text text-transparent"> digital verwalten</span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-medical-subtitle mb-8 max-w-2xl mx-auto">
              ResidentTrack ist die führende Plattform für Assistenzärzt:innen zur FMH-konformen 
              Dokumentation ihres Ausbildungsfortschritts und zur europäischen Kurssuche.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button variant="hero" size="xl" className="gap-2 shadow-medical">
                Als Resident starten
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button variant="swiss" size="xl" className="gap-2">
                <BookOpen className="w-5 h-5" />
                Demo ansehen
              </Button>
              <Button variant="outline" size="xl">
                Kurs anbieten
              </Button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-progress-complete" />
                <span>FMH-zertifiziert</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-progress-complete" />
                <span>DSGVO-konform</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-progress-complete" />
                <span>500+ Residents</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Interactive Demo Section */}
      <div className="bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <Badge variant="outline" className="mb-4">Live Demo</Badge>
            <h2 className="text-3xl font-bold text-card-foreground mb-4">
              Fortschritt in Echtzeit verfolgen
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Erleben Sie selbst, wie ResidentTrack Ihren Ausbildungsfortschritt 
              von PGY1 bis PGY6 visualisiert und Ihre FMH-Anforderungen überwacht.
            </p>
          </div>
          
          <InteractiveProgressDemo />
        </div>
      </div>
      
      {/* Features Grid */}
      <div className="bg-swiss-gray/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="medical-card p-6 text-center">
                <div className="w-12 h-12 bg-gradient-medical rounded-medical flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-semibold text-card-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};