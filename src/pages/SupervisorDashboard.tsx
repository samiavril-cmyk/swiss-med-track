import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthResilient } from '@/hooks/useAuthResilient';
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
  Clock,
  UserCheck,
  BarChart3,
  FileText,
  Calendar,
  GraduationCap,
  UserPlus,
  Settings,
  Loader2
} from 'lucide-react';
import { Header } from '@/components/Header';
import TeamManagement from '@/components/TeamManagement';

interface ResidentSummary {
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
  overall_progress?: number;
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

type RawModuleProgress = {
  module_name: string;
  module_key: string;
  total_weighted_score: number | string | null;
  total_minimum: number | string | null;
  progress_percentage: number | string | null;
  responsible_count: number | string | null;
  instructing_count: number | string | null;
  assistant_count: number | string | null;
  last_procedure_date: string | null;
};

const calculateOverallProgress = (modules: ModuleProgress[]): number => {
  const totals = modules.reduce(
    (acc, module) => ({
      weighted: acc.weighted + module.total_weighted_score,
      minimum: acc.minimum + module.total_minimum
    }),
    { weighted: 0, minimum: 0 }
  );

  if (totals.minimum <= 0) {
    return 0;
  }

  const progress = (totals.weighted / totals.minimum) * 100;
  return Math.min(100, Number(progress.toFixed(1)));
};

const recalculateTeamStats = (residentList: ResidentSummary[]): TeamStats => {
  const totalResidents = residentList.length;
  const activeResidents = residentList.filter((resident) => !!resident.last_activity).length;
  const totalProcedures = residentList.reduce((sum, resident) => sum + (resident.total_procedures || 0), 0);
  const averageProgress = totalResidents > 0
    ? residentList.reduce((sum, resident) => sum + (resident.overall_progress ?? 0), 0) / totalResidents
    : 0;
  const needsAttention = residentList.filter((resident) => (resident.overall_progress ?? 0) < 60).length;

  return {
    totalResidents,
    activeResidents,
    totalProcedures,
    averageProgress,
    needsAttention
  };
};

const normalizeModule = (module: RawModuleProgress): ModuleProgress => ({
  module_name: module.module_name,
  module_key: module.module_key,
  total_weighted_score: Number(module.total_weighted_score ?? 0),
  total_minimum: Number(module.total_minimum ?? 0),
  progress_percentage: Number(module.progress_percentage ?? 0),
  responsible_count: Number(module.responsible_count ?? 0),
  instructing_count: Number(module.instructing_count ?? 0),
  assistant_count: Number(module.assistant_count ?? 0),
  last_procedure_date: module.last_procedure_date ?? null
});

const getProgressColor = (percentage: number) => {
  if (percentage >= 80) return 'text-green-600';
  if (percentage >= 60) return 'text-yellow-600';
  return 'text-red-600';
};

const SupervisorDashboard: React.FC = () => {
  const { user } = useAuthResilient();
  const [residents, setResidents] = useState<ResidentSummary[]>([]);
  const [residentProgressMap, setResidentProgressMap] = useState<Record<string, ModuleProgress[]>>({});
  const [selectedResident, setSelectedResident] = useState<ResidentSummary | null>(null);
  const [residentProgress, setResidentProgress] = useState<ModuleProgress[]>([]);
  const [teamStats, setTeamStats] = useState<TeamStats>({
    totalResidents: 0,
    activeResidents: 0,
    totalProcedures: 0,
    averageProgress: 0,
    needsAttention: 0
  });
  const [activeTab, setActiveTab] = useState<'team' | 'management' | 'progress' | 'reports'>('team');
  const [loading, setLoading] = useState(true);
  const [progressLoading, setProgressLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSupervisorData = useCallback(async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);

      const { data: residentsData, error: residentsError } = await supabase
        .rpc('get_supervisor_residents', { supervisor_user_id: user.id });

      if (residentsError) {
        console.error('Error loading residents:', residentsError);
        setError('Fehler beim Laden der Residents');
        return;
      }

      const parsedResidents = (residentsData ?? []) as ResidentSummary[];

      const progressResults = await Promise.all(parsedResidents.map(async (resident) => {
        try {
          const { data: progressData, error: progressError } = await supabase
            .rpc('get_resident_progress_summary', { resident_user_id: resident.resident_id });

          if (progressError) {
            console.error('Error loading resident progress:', progressError);
            return { id: resident.resident_id, modules: [] as ModuleProgress[], overall: 0 };
          }

          const modules = (progressData ?? []).map(normalizeModule);
          return { id: resident.resident_id, modules, overall: calculateOverallProgress(modules) };
        } catch (progressErr) {
          console.error('Unexpected error while loading progress:', progressErr);
          return { id: resident.resident_id, modules: [] as ModuleProgress[], overall: 0 };
        }
      }));

      const progressMap: Record<string, ModuleProgress[]> = {};
      const residentsWithProgress = parsedResidents.map((resident) => {
        const progressEntry = progressResults.find((entry) => entry.id === resident.resident_id);
        if (progressEntry) {
          progressMap[resident.resident_id] = progressEntry.modules;
          return { ...resident, overall_progress: progressEntry.overall };
        }
        return { ...resident, overall_progress: 0 };
      });

      setResidentProgressMap(progressMap);
      setResidents(residentsWithProgress);
      setTeamStats(recalculateTeamStats(residentsWithProgress));

      setSelectedResident((current) => {
        if (!current) {
          setResidentProgress([]);
          return null;
        }

        const updatedSelected = residentsWithProgress.find((resident) => resident.resident_id === current.resident_id) || null;
        if (updatedSelected) {
          setResidentProgress(progressMap[updatedSelected.resident_id] || []);
        } else {
          setResidentProgress([]);
        }

        return updatedSelected;
      });
    } catch (err) {
      console.error('Error in loadSupervisorData:', err);
      setError('Fehler beim Laden der Supervisor-Daten');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      loadSupervisorData();
    }
  }, [user?.id, loadSupervisorData]);

  const loadResidentProgress = async (residentId: string) => {
    try {
      setProgressLoading(true);
      const { data: progressData, error: progressError } = await supabase
        .rpc('get_resident_progress_summary', { resident_user_id: residentId });

      if (progressError) {
        console.error('Error loading resident progress:', progressError);
        return;
      }

      const modules = (progressData ?? []).map(normalizeModule);
      setResidentProgressMap((prev) => ({ ...prev, [residentId]: modules }));
      setResidentProgress(modules);
      setResidents((prevResidents) => {
        const updatedResidents = prevResidents.map((resident) =>
          resident.resident_id === residentId
            ? { ...resident, overall_progress: calculateOverallProgress(modules) }
            : resident
        );
        setTeamStats(recalculateTeamStats(updatedResidents));
        return updatedResidents;
      });
    } catch (err) {
      console.error('Error in loadResidentProgress:', err);
    } finally {
      setProgressLoading(false);
    }
  };

  const handleResidentSelect = (resident: ResidentSummary) => {
    setSelectedResident(resident);
    setActiveTab('progress');

    const cachedProgress = residentProgressMap[resident.resident_id];
    if (cachedProgress) {
      setResidentProgress(cachedProgress);
      return;
    }

    loadResidentProgress(resident.resident_id);
  };

  const formatDate = (value: string | null) => {
    if (!value) {
      return 'Keine Aktivität';
    }

    try {
      return new Date(value).toLocaleDateString('de-DE');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unbekannt';
    }
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

  const sortedResidents = [...residents].sort((a, b) => (b.overall_progress ?? 0) - (a.overall_progress ?? 0));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Supervisor Dashboard
          </h1>
          <p className="text-gray-600">
            Überblick über Ihre Residents und deren Fortschritt
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Team Übersicht
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Team Größe</span>
                  <span className="text-2xl font-bold">{teamStats.totalResidents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Aktive Residents</span>
                  <span className="text-lg font-semibold text-green-600">{teamStats.activeResidents}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Gesamt Prozeduren</span>
                  <span className="text-lg font-semibold text-blue-600">{teamStats.totalProcedures}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Fortschritt
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Team-Durchschnitt</span>
                    <span className="font-semibold">{Math.round(teamStats.averageProgress)}%</span>
                  </div>
                  <Progress value={teamStats.averageProgress} className="h-2" />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Benötigt Aufmerksamkeit</span>
                  <span className={`font-semibold ${teamStats.needsAttention > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {teamStats.needsAttention}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Schnellaktionen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => setActiveTab('management')}>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Resident hinzufügen
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="h-4 w-4 mr-2" />
                  Bericht exportieren
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Einstellungen
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-purple-600" />
                  Team Fortschritt
                </CardTitle>
                <CardDescription>
                  Übersicht über die Residents in Ihrem Team und ihren aktuellen Fortschritt
                </CardDescription>
              </CardHeader>
              <CardContent>
                {sortedResidents.length > 0 ? (
                  <div className="space-y-4">
                    {sortedResidents.map((resident) => (
                      <div key={resident.resident_id} className="border rounded-lg p-4 bg-white/60 backdrop-blur">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{resident.resident_name}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1">
                              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                                PGY {resident.pgy_level}
                              </Badge>
                              {resident.team_name && <span>{resident.team_name}</span>}
                              {resident.hospital && <span>{resident.hospital}</span>}
                            </div>
                          </div>
                          <div className="w-full md:w-64">
                            <div className="flex justify-between text-sm text-gray-600">
                              <span>Fortschritt</span>
                              <span className="font-semibold">{Math.round(resident.overall_progress ?? 0)}%</span>
                            </div>
                            <Progress value={resident.overall_progress ?? 0} className="mt-2" />
                          </div>
                          <Button variant="outline" size="sm" onClick={() => handleResidentSelect(resident)}>
                            Details ansehen
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 text-gray-600">
                    Keine Residents vorhanden. Legen Sie Teams und Mitglieder im Tab "Team Management" an.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="space-y-6">
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
                  Wählen Sie einen Resident aus, um detaillierte Informationen zu sehen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {sortedResidents.map((resident) => (
                    <Card
                      key={resident.resident_id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedResident?.resident_id === resident.resident_id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => handleResidentSelect(resident)}
                    >
                      <CardContent className="p-4 space-y-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg">{resident.resident_name}</h3>
                            <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600 mt-1">
                              <Badge variant="outline">PGY {resident.pgy_level}</Badge>
                              {resident.department && <span>{resident.department}</span>}
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span>Fortschritt</span>
                            <span className="font-semibold">{Math.round(resident.overall_progress ?? 0)}%</span>
                          </div>
                          <Progress value={resident.overall_progress ?? 0} />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <UserCheck className="h-4 w-4" />
                            {resident.total_procedures} dokumentierte Prozeduren
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {resident.last_activity ? `Letzte Aktivität: ${formatDate(resident.last_activity)}` : 'Keine Aktivität'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Seit {new Date(resident.joined_at).toLocaleDateString('de-DE')}
                          </div>
                          {resident.team_name && (
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4" />
                              {resident.team_name}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="management" className="space-y-6">
            <TeamManagement onMembershipChange={loadSupervisorData} />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            {selectedResident ? (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Fortschritt: {selectedResident.resident_name}</CardTitle>
                    <CardDescription>
                      Übersicht über alle FMH-Module von {selectedResident.resident_name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="block text-gray-500">Klinik</span>
                        <span className="font-semibold">{selectedResident.hospital || 'Unbekannt'}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500">Team</span>
                        <span className="font-semibold">{selectedResident.team_name || 'Nicht zugewiesen'}</span>
                      </div>
                      <div>
                        <span className="block text-gray-500">Fortschritt gesamt</span>
                        <span className={`font-semibold ${getProgressColor(selectedResident.overall_progress ?? 0)}`}>
                          {Math.round(selectedResident.overall_progress ?? 0)}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Module & Meilensteine</CardTitle>
                    <CardDescription>Detailübersicht über die erfassten Prozeduren</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {progressLoading ? (
                      <div className="py-10 text-center text-gray-600">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-blue-600" />
                        Fortschritt wird geladen...
                      </div>
                    ) : residentProgress.length > 0 ? (
                      <div className="space-y-4">
                        {residentProgress.map((module) => (
                          <div key={module.module_key} className="border rounded-lg p-4 bg-white/70 backdrop-blur">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-semibold">{module.module_name}</h4>
                              <Badge className={getProgressColor(module.progress_percentage)}>
                                {Math.round(module.progress_percentage)}%
                              </Badge>
                            </div>

                            <Progress value={module.progress_percentage} className="mb-3" />

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Verantwortlich</span>
                                <div className="font-semibold">{module.responsible_count}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Instruierend</span>
                                <div className="font-semibold">{module.instructing_count}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Assistent</span>
                                <div className="font-semibold">{module.assistant_count}</div>
                              </div>
                              <div>
                                <span className="text-gray-600">Minimum</span>
                                <div className="font-semibold">{module.total_minimum}</div>
                              </div>
                            </div>

                            <div className="mt-3 text-sm text-gray-500">
                              Letzte Prozedur: {module.last_procedure_date ? formatDate(module.last_procedure_date) : 'Keine Aufzeichnungen'}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 text-center text-gray-600">
                        Noch keine Prozeduren für dieses Modul erfasst.
                      </div>
                    )}
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
