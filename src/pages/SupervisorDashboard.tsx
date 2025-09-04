import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  UserCheck,
  BarChart3,
  FileText,
  Calendar,
  Stethoscope,
  Settings
} from 'lucide-react';
import { Header } from '@/components/Header';
import TeamManagement from '@/components/TeamManagement';

interface Resident {
  resident_id: string;
  resident_name: string;
  resident_email: string;
  pgy_level: number;
  department: string;
  hospital: string;
  team_name: string;
  joined_at: string;
  total_procedures: number;
  last_activity: string | null;
}

interface ModuleProgress {
  module_name: string;
  module_key: string;
  total_weighted_score: number;
  total_minimum: number;
  progress_percentage: number;
  responsible_count: number;
  instructing_count: number;
  assistant_count: number;
  last_procedure_date: string | null;
}

interface TeamStats {
  totalResidents: number;
  activeResidents: number;
  totalProcedures: number;
  averageProgress: number;
  needsAttention: number;
}

const SupervisorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [residentProgress, setResidentProgress] = useState<ModuleProgress[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalResidents: 0,
    activeResidents: 0,
    totalProcedures: 0,
    averageProgress: 0,
    needsAttention: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadSupervisorData();
    }
  }, [user]);

  const loadSupervisorData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load supervisor's residents
      const { data: residentsData, error: residentsError } = await supabase
        .rpc('get_supervisor_residents', { supervisor_user_id: user?.id });

      if (residentsError) {
        console.error('Error loading residents:', residentsError);
        setError('Fehler beim Laden der Residents');
        return;
      }

      setResidents(residentsData || []);

      // Calculate team statistics
      const stats: TeamStats = {
        totalResidents: residentsData?.length || 0,
        activeResidents: residentsData?.filter((r: Resident) => r.last_activity)?.length || 0,
        totalProcedures: residentsData?.reduce((sum: number, r: Resident) => sum + r.total_procedures, 0) || 0,
        averageProgress: 0, // Will be calculated per resident
        needsAttention: 0 // Will be calculated based on progress
      };

      setTeamStats(stats);

    } catch (err) {
      console.error('Error in loadSupervisorData:', err);
      setError('Fehler beim Laden der Supervisor-Daten');
    } finally {
      setLoading(false);
    }
  };

  const loadResidentProgress = async (residentId: string) => {
    try {
      const { data: progressData, error: progressError } = await supabase
        .rpc('get_resident_progress_summary', { resident_user_id: residentId });

      if (progressError) {
        console.error('Error loading resident progress:', progressError);
        return;
      }

      setResidentProgress(progressData || []);
    } catch (err) {
      console.error('Error in loadResidentProgress:', err);
    }
  };

  const handleResidentSelect = (resident: Resident) => {
    setSelectedResident(resident);
    loadResidentProgress(resident.resident_id);
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Lade Supervisor-Dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Alert className="max-w-2xl mx-auto">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Supervisor Dashboard
          </h1>
          <p className="text-gray-600">
            Überblick über Ihre Residents und deren Fortschritt
          </p>
        </div>

        {/* Team Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Größe</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.totalResidents}</div>
              <p className="text-xs text-muted-foreground">
                {teamStats.activeResidents} aktiv
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Gesamt Prozeduren</CardTitle>
              <Stethoscope className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.totalProcedures}</div>
              <p className="text-xs text-muted-foreground">
                Alle Residents
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Durchschnittlicher Fortschritt</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.averageProgress.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                Team-Durchschnitt
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Benötigt Aufmerksamkeit</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamStats.needsAttention}</div>
              <p className="text-xs text-muted-foreground">
                Residents
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="team" className="space-y-6">
          <TabsList>
            <TabsTrigger value="team">Team Übersicht</TabsTrigger>
            <TabsTrigger value="management">Team Management</TabsTrigger>
            <TabsTrigger value="progress">Fortschritt Details</TabsTrigger>
            <TabsTrigger value="reports">Berichte</TabsTrigger>
          </TabsList>

          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ihre Residents</CardTitle>
                <CardDescription>
                  Klicken Sie auf einen Resident, um detaillierte Informationen zu sehen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {residents.map((resident) => (
                    <Card 
                      key={resident.resident_id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedResident?.resident_id === resident.resident_id 
                          ? 'ring-2 ring-blue-500' 
                          : ''
                      }`}
                      onClick={() => handleResidentSelect(resident)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold text-lg">{resident.resident_name}</h3>
                          <Badge variant="outline">PGY {resident.pgy_level}</Badge>
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            {resident.total_procedures} Prozeduren
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {resident.last_activity 
                              ? `Letzte Aktivität: ${new Date(resident.last_activity).toLocaleDateString('de-DE')}`
                              : 'Keine Aktivität'
                            }
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Seit: {new Date(resident.joined_at).toLocaleDateString('de-DE')}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <TeamManagement />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {selectedResident ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Fortschritt: {selectedResident.resident_name}</CardTitle>
                    <CardDescription>
                      Detaillierte Übersicht über FMH-Module
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {residentProgress.map((module) => (
                        <div key={module.module_key} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-semibold">{module.module_name}</h4>
                            <Badge className={getProgressColor(module.progress_percentage)}>
                              {module.progress_percentage.toFixed(1)}%
                            </Badge>
                          </div>
                          
                          <Progress 
                            value={module.progress_percentage} 
                            className="mb-2"
                          />
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Verantwortlich:</span>
                              <div className="font-semibold">{module.responsible_count}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Instruierend:</span>
                              <div className="font-semibold">{module.instructing_count}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Assistent:</span>
                              <div className="font-semibold">{module.assistant_count}</div>
                            </div>
                            <div>
                              <span className="text-gray-600">Minimum:</span>
                              <div className="font-semibold">{module.total_minimum}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Wählen Sie einen Resident</h3>
                  <p className="text-gray-600">
                    Klicken Sie auf einen Resident in der Team-Übersicht, um dessen Fortschritt zu sehen.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Berichte & Dokumentation</CardTitle>
                <CardDescription>
                  Erstellen Sie Berichte über den Fortschritt Ihrer Residents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Berichte-Funktion</h3>
                  <p className="text-gray-600 mb-4">
                    Diese Funktion wird in der nächsten Version implementiert.
                  </p>
                  <Button disabled>
                    Bericht erstellen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
