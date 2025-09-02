import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Text Content */}
            <div className="text-center lg:text-left">
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
              <p className="text-medical-subtitle mb-8 max-w-2xl mx-auto lg:mx-0">
                ResidentTrack ist die führende Plattform für Assistenzärzt:innen zur FMH-konformen 
                Dokumentation ihres Ausbildungsfortschritts und zur europäischen Kurssuche.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center mb-12">
                <Button variant="default" size="lg" className="gap-2 shadow-card-hover">
                  Als Resident starten
                  <ArrowRight className="w-5 h-5" />
                </Button>
                <Button variant="secondary" size="lg" className="gap-2">
                  <BookOpen className="w-5 h-5" />
                  Demo ansehen
                </Button>
                <Button variant="outline" size="lg">
                  Kurs anbieten
                </Button>
              </div>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center lg:justify-start items-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-activity-mint" />
                  <span>FMH optimiert</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-activity-mint" />
                  <span>DSGVO-konform</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-activity-mint" />
                  <span>500+ Residents</span>
                </div>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                {/* Main Hero Image - FMH Training Timeline */}
                <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-8">
                  {/* Timeline Background */}
                  <div className="relative h-96">
                    {/* Central Timeline Line */}
                    <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-200 via-teal-400 to-teal-200 rounded-full"></div>
                    
                    {/* Timeline Nodes and Content */}
                    <div className="space-y-8">
                      {/* PGY-1 */}
                      <div className="relative flex items-start gap-6">
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg bg-green-500">
                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-yellow-500">⭐</span>
                              <h4 className="font-bold text-gray-900 text-sm">PGY-1: Basis Notfallchirurgie</h4>
                            </div>
                            <p className="text-xs text-gray-600">85 Prozeduren erforderlich</p>
                          </div>
                        </div>
                      </div>

                      {/* PGY-2 */}
                      <div className="relative flex items-start gap-6">
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg bg-blue-500">
                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500"></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-yellow-500">⭐</span>
                              <h4 className="font-bold text-gray-900 text-sm">PGY-2: Basis Allgemeinchirurgie</h4>
                            </div>
                            <p className="text-xs text-gray-600">260 Prozeduren erforderlich</p>
                          </div>
                        </div>
                      </div>

                      {/* PGY-3 */}
                      <div className="relative flex items-start gap-6">
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg bg-purple-500">
                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                            <h4 className="font-medium text-gray-900 text-sm">PGY-3: Viszeralchirurgie</h4>
                            <p className="text-xs text-gray-600">165 Prozeduren erforderlich</p>
                          </div>
                        </div>
                      </div>

                      {/* PGY-4 */}
                      <div className="relative flex items-start gap-6">
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg bg-orange-500">
                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                            <h4 className="font-medium text-gray-900 text-sm">PGY-4: Traumatologie</h4>
                            <p className="text-xs text-gray-600">165 Prozeduren erforderlich</p>
                          </div>
                        </div>
                      </div>

                      {/* PGY-5 */}
                      <div className="relative flex items-start gap-6">
                        <div className="relative z-10 flex-shrink-0">
                          <div className="w-4 h-4 rounded-full border-2 border-white shadow-lg bg-red-500">
                            <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500"></div>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm">
                            <h4 className="font-medium text-gray-900 text-sm">PGY-5: Kombination</h4>
                            <p className="text-xs text-gray-600">165 Prozeduren erforderlich</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Timeline Title */}
                  <div className="absolute top-4 left-4">
                    <h3 className="text-lg font-bold text-gray-800">FMH Training Timeline</h3>
                    <p className="text-xs text-gray-600">Chirurgische Ausbildung 2024</p>
                  </div>
                </div>

                {/* Floating Cards */}
                <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-lg p-4 border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">85 Prozeduren</p>
                      <p className="text-xs text-muted-foreground">Basis Notfall</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-lg p-4 border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">260 Prozeduren</p>
                      <p className="text-xs text-muted-foreground">Basis Allgemein</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Background Decoration */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl -z-10 transform rotate-3 scale-105"></div>
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
          

        </div>
      </div>
      
      {/* Features Grid */}
      <div className="bg-muted/30">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="medical-card p-6 text-center">
                <div className="w-12 h-12 bg-primary rounded-medical flex items-center justify-center mx-auto mb-4">
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