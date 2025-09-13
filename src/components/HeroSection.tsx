import React from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Link } from 'react-router-dom';

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
                <Link to="/auth">
                  <Button variant="default" size="lg" className="gap-2 shadow-card-hover">
                    Als Resident starten
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="secondary" size="lg" className="gap-2">
                    <BookOpen className="w-5 h-5" />
                    Demo ansehen
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" size="lg">
                    Kurs anbieten
                  </Button>
                </Link>
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

            {/* Right Column - Modern Hero Visual */}
            <div className="relative">
              {/* Main Visual Container */}
              <div className="relative">
                {/* Background with subtle pattern */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-100 rounded-3xl"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)] rounded-3xl"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(16,185,129,0.1),transparent_50%)] rounded-3xl"></div>
                
                {/* Main Content */}
                <div className="relative z-10 p-8">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm border border-white/20 mb-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-slate-700">Live Dashboard</span>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">FMH Training Progress</h3>
                    <p className="text-sm text-slate-600">Chirurgische Ausbildung 2024</p>
                  </div>

                  {/* Progress Rings */}
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    {/* PGY-1 Progress */}
                    <div className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-3">
                        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-200"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-green-500"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray="85, 100"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-slate-700">85%</span>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-slate-700">PGY-1</div>
                      <div className="text-xs text-slate-500">Notfall</div>
                    </div>

                    {/* PGY-2 Progress */}
                    <div className="text-center">
                      <div className="relative w-20 h-20 mx-auto mb-3">
                        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                          <path
                            className="text-slate-200"
                            stroke="currentColor"
                            strokeWidth="3"
                            fill="none"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                          <path
                            className="text-blue-500"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            fill="none"
                            strokeDasharray="60, 100"
                            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-bold text-slate-700">60%</span>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-slate-700">PGY-2</div>
                      <div className="text-xs text-slate-500">Allgemein</div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-lg font-bold text-slate-800">345</div>
                      <div className="text-xs text-slate-600">Prozeduren</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-lg font-bold text-slate-800">12</div>
                      <div className="text-xs text-slate-600">Kurse</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-lg font-bold text-slate-800">95%</div>
                      <div className="text-xs text-slate-600">Fortschritt</div>
                    </div>
                    <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                      <div className="text-lg font-bold text-slate-800">2.5</div>
                      <div className="text-xs text-slate-600">Jahre</div>
                    </div>
                  </div>
                </div>

                {/* Floating Elements */}
                <div className="absolute -top-2 -left-2 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                
                <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
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