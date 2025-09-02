import React from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Users, 
  BookOpen, 
  Award, 
  Stethoscope, 
  FileText, 
  Calendar,
  TrendingUp,
  Shield,
  Zap,
  Target,
  BarChart3,
  Clock,
  Globe,
  Smartphone,
  Database,
  Lock,
  ArrowRight
} from 'lucide-react';

const features = [
  {
    icon: Stethoscope,
    title: 'FMH-konforme Prozeduren-Tracking',
    description: 'Vollständige Dokumentation aller chirurgischen Eingriffe nach FMH-Standards mit automatischer Kategorisierung und Fortschrittsverfolgung.',
    benefits: ['Automatische Kategorisierung', 'FMH-Mindestanforderungen', 'Echtzeit-Fortschritt'],
    color: 'text-activity-mint'
  },
  {
    icon: BookOpen,
    title: 'Intelligentes Kurs-Management',
    description: 'Verwalten Sie Pflichtkurse, Fortbildungen und Examen mit automatischen Erinnerungen und Fortschritts-Tracking.',
    benefits: ['Kurs-Timeline', 'Automatische Erinnerungen', 'Zertifikat-Verwaltung'],
    color: 'text-activity-coral'
  },
  {
    icon: FileText,
    title: 'Publikations-Portfolio',
    description: 'Dokumentieren Sie Ihre wissenschaftlichen Arbeiten und verfolgen Sie Ihren akademischen Fortschritt.',
    benefits: ['Google Scholar Integration', 'Impact-Tracking', 'Kollaborations-Netzwerk'],
    color: 'text-activity-lavender'
  },
  {
    icon: Award,
    title: 'Awards & Auszeichnungen',
    description: 'Sammeln und präsentieren Sie Ihre Erfolge und Auszeichnungen in einem professionellen Portfolio.',
    benefits: ['Portfolio-Ansicht', 'Erfolgs-Tracking', 'Networking-Tools'],
    color: 'text-activity-amber'
  },
  {
    icon: BarChart3,
    title: 'Analytics & Insights',
    description: 'Detaillierte Analysen Ihres Ausbildungsfortschritts mit Gap-Analysen und Empfehlungen.',
    benefits: ['Gap-Analysen', 'Trend-Vorhersagen', 'Personalisierte Empfehlungen'],
    color: 'text-blue-500'
  },
  {
    icon: Shield,
    title: 'Datenschutz & Sicherheit',
    description: 'Höchste Sicherheitsstandards für Ihre sensiblen medizinischen Daten mit DSGVO-Konformität.',
    benefits: ['End-to-End Verschlüsselung', 'DSGVO-konform', 'Sichere Cloud-Speicherung'],
    color: 'text-green-500'
  }
];

const technicalFeatures = [
  {
    icon: Zap,
    title: 'Echtzeit-Synchronisation',
    description: 'Alle Daten werden in Echtzeit zwischen Geräten synchronisiert.'
  },
  {
    icon: Globe,
    title: 'Multi-Platform',
    description: 'Funktioniert auf Desktop, Tablet und Smartphone.'
  },
  {
    icon: Database,
    title: 'Robuste Datenbank',
    description: 'Supabase-basierte, skalierbare Datenbank-Architektur.'
  },
  {
    icon: Lock,
    title: 'Sichere Authentifizierung',
    description: 'Moderne OAuth-Integration mit Supabase Auth.'
  }
];

const pricingPlans = [
  {
    name: 'Resident',
    price: 'Kostenlos',
    period: 'Für Einzelpersonen',
    features: [
      'Basis Prozeduren-Tracking',
      'Kurs-Management',
      'Einfache Analytics',
      'Community-Support'
    ],
    popular: false
  },
  {
    name: 'Professional',
    price: 'CHF 29',
    period: 'pro Monat',
    features: [
      'Alle Resident Features',
      'Erweiterte Analytics',
      'Publikations-Portfolio',
      'Awards-Tracking',
      'Priority Support',
      'API-Zugang'
    ],
    popular: true
  },
  {
    name: 'Institution',
    price: 'CHF 99',
    period: 'pro Monat',
    features: [
      'Alle Professional Features',
      'Multi-User Management',
      'Institutionelle Dashboards',
      'Custom Branding',
      'Dedicated Support',
      'On-Premise Option'
    ],
    popular: false
  }
];

const Features = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold text-card-foreground mb-6">
                Alle Features auf einen Blick
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                Entdecken Sie die umfassenden Funktionen von ResidentTrack, 
                die Ihre chirurgische Ausbildung revolutionieren.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="bg-gradient-medical">
                  Jetzt starten
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline">
                  Demo ansehen
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-card-foreground mb-4">
                Kernfunktionen
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Alles was Sie für eine erfolgreiche chirurgische Ausbildung benötigen
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="medical-card p-6 hover:shadow-elegant transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-medical bg-gradient-to-br from-primary/10 to-secondary/10`}>
                      <feature.icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-card-foreground mb-3">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {feature.description}
                      </p>
                      <div className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm text-muted-foreground">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Features */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-card-foreground mb-4">
                Technische Highlights
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Moderne Technologie für optimale Performance und Sicherheit
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {technicalFeatures.map((feature, index) => (
                <Card key={index} className="medical-card p-6 text-center">
                  <div className="p-4 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-medical w-fit mx-auto mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-card-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-card-foreground mb-4">
                Preise
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Wählen Sie den Plan, der zu Ihren Bedürfnissen passt
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <Card key={index} className={`medical-card p-8 relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-medical">
                      Beliebt
                    </Badge>
                  )}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-card-foreground mb-2">
                      {plan.name}
                    </h3>
                    <div className="text-4xl font-bold text-primary mb-2">
                      {plan.price}
                    </div>
                    <p className="text-muted-foreground">
                      {plan.period}
                    </p>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${plan.popular ? 'bg-gradient-medical' : ''}`}
                    variant={plan.popular ? 'default' : 'outline'}
                  >
                    {plan.name === 'Resident' ? 'Kostenlos starten' : 'Plan wählen'}
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-primary/10 to-secondary/10">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-card-foreground mb-4">
              Bereit für den nächsten Schritt?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Starten Sie noch heute mit ResidentTrack und revolutionieren Sie Ihre chirurgische Ausbildung.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-gradient-medical">
                Kostenlos registrieren
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                Kontakt aufnehmen
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Features;
