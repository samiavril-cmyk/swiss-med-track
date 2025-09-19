import React, { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActivityRing } from '@/components/ActivityRing';
import { ProgressBar } from '@/components/ProgressBar';
import { VerticalCourseTimeline, mockCourses2024, mockCourses2025, mockCourses2026, mockAllCourses } from '@/components/VerticalCourseTimeline';
import PublicationsShowcase from '@/components/PublicationsShowcase';
import { X, Calendar, TrendingUp, BookOpen, Award, FileText, Stethoscope } from 'lucide-react';

interface ActivityAward {
  icon: ReactNode;
  title: string;
  organization: string;
  date: string;
}

interface ActivityDetailData {
  completed?: number;
  target?: number;
  points?: number;
  count?: number;
  byYear?: Record<string, number>;
  items?: ActivityAward[];
  [key: string]: unknown;
}

interface ActivityDrillDownProps {
  activityId: string;
  data: ActivityDetailData;
  onClose: () => void;
}

export const ActivityDrillDown: React.FC<ActivityDrillDownProps> = ({
  activityId,
  data,
  onClose
}) => {
  const getActivityConfig = (id: string) => {
    const configs = {
      courses: {
        title: 'Kurse & Fortbildungen',
        icon: BookOpen,
        variant: 'coral' as const,
        color: 'hsl(var(--activity-coral))'
      },
      mandatory: {
        title: 'Examen & Prüfungen',
        icon: Award,
        variant: 'lavender' as const,
        color: 'hsl(var(--activity-lavender))'
      },
      procedures: {
        title: 'OP-Prozeduren',
        icon: Stethoscope,
        variant: 'mint' as const,
        color: 'hsl(var(--activity-mint))'
      },
      publications: {
        title: 'Publikationen',
        icon: FileText,
        variant: 'lavender' as const,
        color: 'hsl(var(--activity-lavender))'
      },
      awards: {
        title: 'Awards & Auszeichnungen',
        icon: Award,
        variant: 'amber' as const,
        color: 'hsl(var(--activity-amber))'
      }
    };
    return configs[id as keyof typeof configs] || configs.courses;
  };

  const config = getActivityConfig(activityId);
  const IconComponent = config.icon;

  const metrics = {
    completed: typeof data.completed === 'number' ? data.completed : 0,
    target: typeof data.target === 'number' ? data.target : 0,
    count: typeof data.count === 'number' ? data.count : 0,
    points: typeof data.points === 'number' ? data.points : 0
  };

  const renderCoursesContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">{metrics.completed}</p>
            <p className="text-sm text-muted-foreground">Abgeschlossen</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">{Math.max(metrics.target - metrics.completed, 0)}</p>
            <p className="text-sm text-muted-foreground">Verbleibend</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">{metrics.points}</p>
            <p className="text-sm text-muted-foreground">Punkte</p>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-card-foreground">Jahresverlauf</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {['2021', '2022', '2023', '2024'].map((year, index) => (
            <div key={year} className="flex items-center justify-between p-4 border border-card-border rounded-medical">
              <span className="font-medium">{year}</span>
              <div className="flex items-center gap-3">
                <ProgressBar 
                  progress={Math.min((index + 1) * 25, 100)} 
                  variant="compact" 
                  className="w-24"
                />
                <Badge variant="outline">{(index + 1) * 7} Kurse</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Examen-Daten
  const examData = [
    {
      id: 'basisexamen',
      title: 'Basisexamen',
      description: 'Grundlagenprüfung für Medizinstudierende',
      status: 'completed',
      date: '2020-03-15',
      score: '85%',
      type: 'required'
    },
    {
      id: 'facharztpruefung',
      title: 'Facharztprüfung Chirurgie',
      description: 'Abschlussprüfung für Facharzt Chirurgie',
      status: 'pending',
      date: '2025-06-20',
      score: null,
      type: 'required'
    },
    {
      id: 'usmle_step1',
      title: 'USMLE Step 1',
      description: 'United States Medical Licensing Examination Step 1',
      status: 'completed',
      date: '2021-08-10',
      score: '245',
      type: 'optional'
    },
    {
      id: 'usmle_step2',
      title: 'USMLE Step 2 CK',
      description: 'Clinical Knowledge Examination',
      status: 'completed',
      date: '2022-05-15',
      score: '258',
      type: 'optional'
    },
    {
      id: 'usmle_step3',
      title: 'USMLE Step 3',
      description: 'Final Step of USMLE',
      status: 'pending',
      date: '2025-03-10',
      score: null,
      type: 'optional'
    },
    {
      id: 'plab',
      title: 'PLAB Test',
      description: 'Professional and Linguistic Assessments Board',
      status: 'not_taken',
      date: null,
      score: null,
      type: 'optional'
    }
  ];

  const renderExamsContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">3</p>
            <p className="text-sm text-muted-foreground">Abgeschlossen</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">2</p>
            <p className="text-sm text-muted-foreground">Ausstehend</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">1</p>
            <p className="text-sm text-muted-foreground">Nicht geplant</p>
          </div>
        </Card>
      </div>

      {/* Examen Timeline */}
      <div className="space-y-4">
        <h4 className="font-semibold text-card-foreground">Examen & Prüfungen</h4>
        <div className="space-y-4">
          {examData.map((exam, index) => (
            <Card key={exam.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-primary to-secondary"></div>
                  <div>
                    <h5 className="font-semibold text-card-foreground flex items-center gap-2">
                      {exam.title}
                      {exam.type === 'required' && <span className="text-red-500">⭐</span>}
                    </h5>
                    <p className="text-sm text-muted-foreground">{exam.description}</p>
                    {exam.date && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {exam.status === 'completed' ? 'Abgeschlossen' : 'Geplant'}: {new Date(exam.date).toLocaleDateString('de-DE')}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {exam.score && (
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {exam.score}
                    </Badge>
                  )}
                  <Badge 
                    variant={exam.status === 'completed' ? 'default' : exam.status === 'pending' ? 'secondary' : 'outline'}
                    className={
                      exam.status === 'completed' ? 'bg-green-100 text-green-800' :
                      exam.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-600'
                    }
                  >
                    {exam.status === 'completed' ? 'Abgeschlossen' : 
                     exam.status === 'pending' ? 'Ausstehend' : 'Nicht geplant'}
                  </Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderProceduresContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">{metrics.completed}</p>
            <p className="text-sm text-muted-foreground">Durchgeführt</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">{metrics.target}</p>
            <p className="text-sm text-muted-foreground">FMH-Ziel</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">
              {metrics.target > 0 ? Math.round((metrics.completed / metrics.target) * 100) : 0}%
            </p>
            <p className="text-sm text-muted-foreground">Fortschritt</p>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-card-foreground">Jahresverlauf</h4>
        <div className="space-y-3">
          {Object.entries(data.byYear ?? {}).map(([year, count]) => {
            const numericCount = typeof count === 'number' ? count : 0;

            return (
            <div key={year} className="flex items-center justify-between p-4 border border-card-border rounded-medical">
              <span className="font-medium">{year}</span>
              <div className="flex items-center gap-3">
                <ProgressBar
                  progress={Math.min((numericCount / 200) * 100, 100)}
                  variant="compact"
                  className="w-32"
                />
                <Badge variant="outline">{String(numericCount)} Prozeduren</Badge>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-card-foreground">Häufigste Prozeduren</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: 'Laparoskopische Cholezystektomie', count: 45 },
            { name: 'Appendektomie', count: 38 },
            { name: 'Hernienreparatur', count: 32 },
            { name: 'Endoskopie', count: 28 }
          ].map((procedure) => (
            <div key={procedure.name} className="flex items-center justify-between p-3 bg-muted/30 rounded-medical">
              <span className="text-sm font-medium">{procedure.name}</span>
              <Badge variant="secondary">{procedure.count}x</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPublicationsContent = () => (
    <PublicationsShowcase />
  );

  const renderAwardsContent = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">{metrics.count}</p>
            <p className="text-sm text-muted-foreground">Auszeichnungen</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">2</p>
            <p className="text-sm text-muted-foreground">National</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">1</p>
            <p className="text-sm text-muted-foreground">International</p>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h4 className="font-semibold text-card-foreground">Alle Auszeichnungen</h4>
        <div className="space-y-3">
          {data.items?.map((award, index) => (
            <div key={`${award.title}-${award.date}-${index}`} className="p-4 border border-card-border rounded-medical">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{award.icon}</span>
                <div className="flex-1">
                  <h5 className="font-medium text-card-foreground">{award.title}</h5>
                  <p className="text-sm text-muted-foreground">{award.organization}</p>
                </div>
                <Badge variant="outline">{award.date}</Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderMandatoryCoursesContent = () => {
    // Guard to prevent crash if mockAllCourses is empty
    if (!mockAllCourses || mockAllCourses.length === 0) {
      return (
        <div className="space-y-6">
          <div className="text-center py-8">
            <p className="text-muted-foreground">Keine Kurse verfügbar</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-4">
            <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">{metrics.completed}</p>
            <p className="text-sm text-muted-foreground">Abgeschlossen</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">{Math.max(metrics.target - metrics.completed, 0)}</p>
            <p className="text-sm text-muted-foreground">Verbleibend</p>
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-card-foreground">{metrics.points}</p>
            <p className="text-sm text-muted-foreground">Punkte</p>
          </div>
        </Card>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-card-foreground">Kurs-Timeline (2024-2026)</h4>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">Alle Jahre</TabsTrigger>
              <TabsTrigger value="2024">2024</TabsTrigger>
              <TabsTrigger value="2025">2025</TabsTrigger>
              <TabsTrigger value="2026">2026</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <VerticalCourseTimeline courses={mockAllCourses} year={2024} />
            </TabsContent>
            
            <TabsContent value="2024" className="mt-4">
              <VerticalCourseTimeline courses={mockCourses2024} year={2024} />
            </TabsContent>
            
            <TabsContent value="2025" className="mt-4">
              <VerticalCourseTimeline courses={mockCourses2025} year={2025} />
            </TabsContent>
            
            <TabsContent value="2026" className="mt-4">
              <VerticalCourseTimeline courses={mockCourses2026} year={2026} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  };

  const renderContent = () => {
    switch (activityId) {
      case 'courses':
        return renderMandatoryCoursesContent(); // Use Pflichtkurse content for Kurse
      case 'mandatory':
        return renderExamsContent(); // Use Examen content for Pflichtkurse
      case 'procedures':
        return renderProceduresContent();
      case 'publications':
        return renderPublicationsContent();
      case 'awards':
        return renderAwardsContent();
      default:
        return renderCoursesContent();
    }
  };

  const safeTarget = metrics.target > 0 ? metrics.target : 1;
  const progress = activityId === 'procedures'
    ? (metrics.completed / safeTarget) * 100
    : activityId === 'courses' || activityId === 'mandatory'
    ? (metrics.completed / safeTarget) * 100
    : Math.min((metrics.count / 5) * 100, 100);

  return (
    <Card className="medical-card p-6 mb-8 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-medical" style={{ backgroundColor: `${config.color}20` }}>
            <IconComponent className="w-6 h-6" style={{ color: config.color }} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-card-foreground">{config.title}</h3>
            <p className="text-muted-foreground">Detailierte Ansicht und Jahresverlauf</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <ActivityRing
            progress={progress}
            variant={config.variant}
            size={80}
            strokeWidth={6}
            showPercentage
          />
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="yearly">Jahresverlauf</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          {renderContent()}
        </TabsContent>
        
        <TabsContent value="yearly" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Fortschrittsverlauf nach Jahren</span>
            </div>
            {renderContent()}
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="mt-6">
          <div className="space-y-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="w-4 h-4" />
              <span>Analyse und Prognosen</span>
            </div>
            <Card className="p-6">
              <h4 className="font-semibold text-card-foreground mb-4">Trend-Analyse</h4>
              <p className="text-muted-foreground">
                Basierend auf Ihrem aktuellen Fortschritt werden Sie Ihr FMH-Ziel voraussichtlich 
                in 18 Monaten erreichen. Ihr Lernfortschritt ist konstant und liegt über dem Durchschnitt.
              </p>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};