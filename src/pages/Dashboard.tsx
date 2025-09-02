import React, { useState, useEffect } from 'react';
import { Header } from '@/components/HeaderSimple';
import { ActivityRing } from '@/components/ActivityRing';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, GraduationCap, Stethoscope, Trophy, FileText, Calendar, Settings, Share2 } from 'lucide-react';
import { ActivityDrillDown } from '@/components/ActivityDrillDown';

interface ActivityData {
  courses: {
    completed: number;
    target: number;
    points: number;
  };
  mandatoryCourses: {
    completed: number;
    target: number;
    points: number;
  };
  procedures: {
    completed: number;
    target: number;
    byYear: Record<string, number>;
  };
  publications: {
    count: number;
    articles: Array<{
      title: string;
      journal: string;
      date: string;
      doi?: string;
    }>;
  };
  awards: {
    count: number;
    items: Array<{
      title: string;
      organization: string;
      date: string;
      icon: string;
    }>;
  };
}

const mockActivityData: ActivityData = {
  courses: { completed: 28, target: 35, points: 142 },
  mandatoryCourses: { completed: 8, target: 12, points: 64 },
  procedures: { 
    completed: 485, 
    target: 600,
    byYear: {
      '2021': 45,
      '2022': 120,
      '2023': 180,
      '2024': 140
    }
  },
  publications: {
    count: 6,
    articles: [
      { title: "Minimally Invasive Cardiac Surgery", journal: "Heart Surgery Today", date: "2024-03-15" },
      { title: "Patient Outcomes in Emergency Medicine", journal: "Emergency Care Journal", date: "2023-11-20" }
    ]
  },
  awards: {
    count: 3,
    items: [
      { title: "Young Surgeon Award", organization: "Swiss Medical Society", date: "2024-01-15", icon: "🏆" },
      { title: "Research Excellence", organization: "University Hospital", date: "2023-09-10", icon: "🎖️" }
    ]
  }
};

export const Dashboard: React.FC = () => {
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null);
  const [animationProgress, setAnimationProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationProgress(100);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const getActivityRings = () => [
    {
      id: 'courses',
      label: 'Kurse',
      progress: (mockActivityData.courses.completed / mockActivityData.courses.target) * 100,
      variant: 'coral' as const,
      icon: BookOpen,
      data: mockActivityData.courses
    },
    {
      id: 'mandatory',
      label: 'Pflichtkurse',
      progress: (mockActivityData.mandatoryCourses.completed / mockActivityData.mandatoryCourses.target) * 100,
      variant: 'lavender' as const,
      icon: GraduationCap,
      data: mockActivityData.mandatoryCourses
    },
    {
      id: 'procedures',
      label: 'Prozeduren',
      progress: (mockActivityData.procedures.completed / mockActivityData.procedures.target) * 100,
      variant: 'mint' as const,
      icon: Stethoscope,
      data: mockActivityData.procedures
    },
    {
      id: 'publications',
      label: 'Publikationen',
      progress: Math.min((mockActivityData.publications.count / 5) * 100, 100),
      variant: 'lavender' as const,
      icon: FileText,
      data: mockActivityData.publications
    },
    {
      id: 'awards',
      label: 'Awards',
      progress: Math.min((mockActivityData.awards.count / 3) * 100, 100),
      variant: 'amber' as const,
      icon: Trophy,
      data: mockActivityData.awards
    }
  ];

  const activityRings = getActivityRings();

  return (
    <div className="min-h-screen bg-background">
              <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-card-foreground mb-2">
              Ihr Ausbildungsdashboard
            </h1>
            <p className="text-muted-foreground">
              Verfolgen Sie Ihren FMH-konformen Fortschritt in Echtzeit
            </p>
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button variant="outline" size="sm" className="gap-2">
              <Share2 className="w-4 h-4" />
              Profil teilen
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="w-4 h-4" />
              Kurse suchen
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Einstellungen
            </Button>
          </div>
        </div>

        {/* Activity Rings Section */}
        <Card className="medical-card p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-card-foreground mb-4">
              Ihr Aktivitätsfortschritt
            </h2>
            <p className="text-muted-foreground">
              Apple Activity-inspirierte Darstellung Ihrer medizinischen Ausbildung
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 justify-items-center">
            {activityRings.map((ring) => {
              const displayProgress = animationProgress > 0 
                ? Math.min(animationProgress * (ring.progress / 100), ring.progress)
                : ring.progress;
                
              return (
                <div key={ring.id} className="flex flex-col items-center">
                  <ActivityRing
                    progress={displayProgress}
                    variant={ring.variant}
                    size={120}
                    strokeWidth={8}
                    label={ring.label}
                    showPercentage
                    onClick={() => setSelectedActivity(ring.id)}
                    className="mb-3 transform transition-all duration-300 hover:scale-110 cursor-pointer"
                  />
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <ring.icon className="w-4 h-4 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs">
                        {ring.id === 'procedures' ? `${(ring.data as { completed: number; target: number }).completed}/${(ring.data as { completed: number; target: number }).target}` :
                         ring.id === 'courses' || ring.id === 'mandatory' ? `${(ring.data as { completed: number; target: number }).completed}/${(ring.data as { completed: number; target: number }).target}` :
                         `${(ring.data as { count?: number; completed?: number }).count || (ring.data as { count?: number; completed?: number }).completed || 0}`}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Activity Drill-Down */}
        {selectedActivity && (
          <ActivityDrillDown
            activityId={selectedActivity}
            data={activityRings.find(ring => ring.id === selectedActivity)?.data}
            onClose={() => setSelectedActivity(null)}
          />
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="medical-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-activity-mint/20 rounded-medical">
                <Stethoscope className="w-6 h-6 text-activity-mint" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktuelle PGY</p>
                <p className="text-2xl font-bold text-card-foreground">PGY-4</p>
              </div>
            </div>
          </Card>
          
          <Card className="medical-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-activity-coral/20 rounded-medical">
                <BookOpen className="w-6 h-6 text-activity-coral" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Punkte gesamt</p>
                <p className="text-2xl font-bold text-card-foreground">206</p>
              </div>
            </div>
          </Card>
          
          <Card className="medical-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-activity-amber/20 rounded-medical">
                <Trophy className="w-6 h-6 text-activity-amber" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bis FMH-Ziel</p>
                <p className="text-2xl font-bold text-card-foreground">24 Mon.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="medical-card p-6">
          <h3 className="text-xl font-semibold text-card-foreground mb-4">
            Letzte Aktivitäten
          </h3>
          
          <Tabs defaultValue="procedures" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="procedures">Prozeduren</TabsTrigger>
              <TabsTrigger value="courses">Kurse</TabsTrigger>
              <TabsTrigger value="publications">Publikationen</TabsTrigger>
              <TabsTrigger value="awards">Awards</TabsTrigger>
            </TabsList>
            
            <TabsContent value="procedures" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-card-border rounded-medical">
                  <div>
                    <p className="font-medium text-card-foreground">Laparoskopische Cholezystektomie</p>
                    <p className="text-sm text-muted-foreground">15. Januar 2024</p>
                  </div>
                  <Badge variant="default">Chirurgie</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border border-card-border rounded-medical">
                  <div>
                    <p className="font-medium text-card-foreground">Appendektomie</p>
                    <p className="text-sm text-muted-foreground">12. Januar 2024</p>
                  </div>
                  <Badge variant="default">Chirurgie</Badge>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="courses" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-card-border rounded-medical">
                  <div>
                    <p className="font-medium text-card-foreground">Advanced Laparoscopy Workshop</p>
                    <p className="text-sm text-muted-foreground">8 CME Punkte • Zürich</p>
                  </div>
                  <Badge variant="secondary">Abgeschlossen</Badge>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="publications" className="mt-6">
              <div className="space-y-4">
                {mockActivityData.publications.articles.map((article, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-card-border rounded-medical">
                    <div>
                      <p className="font-medium text-card-foreground">{article.title}</p>
                      <p className="text-sm text-muted-foreground">{article.journal} • {article.date}</p>
                    </div>
                    <Badge variant="outline">Artikel</Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="awards" className="mt-6">
              <div className="space-y-4">
                {mockActivityData.awards.items.map((award, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-card-border rounded-medical">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{award.icon}</span>
                      <div>
                        <p className="font-medium text-card-foreground">{award.title}</p>
                        <p className="text-sm text-muted-foreground">{award.organization} • {award.date}</p>
                      </div>
                    </div>
                    <Badge variant="default">Auszeichnung</Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
};