import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { X, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ActivityRing } from '@/components/ActivityRing';

interface ProcedureDetail {
  id: string;
  code: string;
  title_de: string;
  min_required_by_pgy: Record<string, number> | null;
  responsible_count: number;
  instructing_count: number;
  assistant_count: number;
  weighted_score: number;
  logs: Array<{
    id: string;
    performed_date: string;
    role_in_surgery: string;
    hospital: string;
    supervisor: string;
  }>;
}

interface ModuleDetailProps {
  moduleKey: string;
  onClose: () => void;
}

export const FMHModuleDetail: React.FC<ModuleDetailProps> = ({ moduleKey, onClose }) => {
  const [moduleData, setModuleData] = useState<{ id: string; title_de: string; minimum_required: number } | null>(null);
  const [procedures, setProcedures] = useState<ProcedureDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPgyLevel, setUserPgyLevel] = useState<number>(4);

  const loadModuleDetails = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user PGY level
      const { data: profile } = await supabase
        .from('profiles')
        .select('pgy_level')
        .eq('user_id', user.id)
        .single();
      
      if (profile?.pgy_level) {
        setUserPgyLevel(profile.pgy_level);
      }

      // Get module info
      const { data: module } = await supabase
        .from('procedure_categories')
        .select('*')
        .eq('key', moduleKey)
        .single();

      if (module) {
        setModuleData({ id: module.id, title_de: module.title_de, minimum_required: module.minimum_required });
      }

      // Get module progress
      const { data: progressData } = await supabase
        .rpc('get_module_progress', {
          user_id_param: user.id,
          module_key: moduleKey
        });

      // Get procedures in this module with user's data
      const { data: proceduresData } = await supabase
        .from('procedures')
        .select(`
          id,
          code,
          title_de,
          min_required_by_pgy
        `)
        .eq('category_id', module?.id)
        .eq('active', true);

      const procedureDetails: ProcedureDetail[] = [];

      for (const proc of proceduresData || []) {
        // Get user's logs for this procedure
        const { data: logs } = await supabase
          .from('procedure_logs')
          .select('*')
          .eq('procedure_id', proc.id)
          .eq('user_id', user.id)
          .order('performed_date', { ascending: false });

        // Count by role
        const responsible_count = logs?.filter(l => l.role_in_surgery === 'primary' || l.role_in_surgery === 'responsible').length || 0;
        const instructing_count = logs?.filter(l => l.role_in_surgery === 'instructing').length || 0;
        const assistant_count = logs?.filter(l => l.role_in_surgery === 'assistant' || l.role_in_surgery === 'assist').length || 0;
        
        // Calculate weighted score
        const weighted_score = responsible_count * 1.0 + instructing_count * 0.75 + assistant_count * 0.5;

        procedureDetails.push({
          ...proc,
          responsible_count,
          instructing_count,
          assistant_count,
          weighted_score,
          logs: logs || []
        });
      }

      setProcedures(procedureDetails);
    } catch (error) {
      console.error('Error loading module details:', error);
    } finally {
      setLoading(false);
    }
  }, [moduleKey]);

  useEffect(() => {
    loadModuleDetails();
  }, [loadModuleDetails]);

  const getModuleVariant = (moduleKey: string) => {
    const variants = {
      'basis_notfall': 'coral' as const,
      'basis_allgemein': 'mint' as const, 
      'viszeralchirurgie': 'lavender' as const,
      'traumatologie': 'amber' as const,
      'kombination': 'coral' as const
    };
    return variants[moduleKey as keyof typeof variants] || 'mint';
  };

  const getRequiredForPgy = (procedure: ProcedureDetail): number => {
    return procedure.min_required_by_pgy?.[`pgy${userPgyLevel}`] ?? 0;
  };

  const calculateProgress = (procedure: ProcedureDetail): number => {
    const required = getRequiredForPgy(procedure);
    if (required === 0) return 0;
    return Math.min(100, (procedure.weighted_score / required) * 100);
  };

  const totalWeightedScore = procedures.reduce((sum, p) => sum + p.weighted_score, 0);
  const totalRequired = moduleData?.minimum_required || 0;
  const moduleProgress = totalRequired > 0 ? Math.min(100, (totalWeightedScore / totalRequired) * 100) : 0;

  if (loading) {
    return (
      <Card className="medical-card mb-8">
        <CardContent className="p-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="medical-card mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-4">
          <ActivityRing
            progress={moduleProgress}
            variant={getModuleVariant(moduleKey)}
            size={80}
            strokeWidth={6}
            showPercentage
          />
          <div>
            <CardTitle className="text-xl text-card-foreground">
              {moduleData?.title_de}
            </CardTitle>
            <p className="text-muted-foreground">
              {totalWeightedScore.toFixed(1)} / {totalRequired} Punkte (gewichtet)
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="procedures">Prozeduren</TabsTrigger>
            <TabsTrigger value="timeline">Verlauf</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Role Distribution */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Rollenverteilung</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Verantwortlich:</span>
                    <Badge variant="default">
                      {procedures.reduce((sum, p) => sum + p.responsible_count, 0)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Instruierend:</span>
                    <Badge variant="secondary">
                      {procedures.reduce((sum, p) => sum + p.instructing_count, 0)}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Assistent:</span>
                    <Badge variant="outline">
                      {procedures.reduce((sum, p) => sum + p.assistant_count, 0)}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Module Progress */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Modulfortschritt</h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Erfüllung</span>
                      <span>{moduleProgress.toFixed(1)}%</span>
                    </div>
                    <Progress value={moduleProgress} className="h-2" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Gewichtung: V=1.0, I=0.75, A=0.5
                  </div>
                </div>
              </Card>

              {/* Quick Stats */}
              <Card className="p-4">
                <h4 className="font-semibold mb-3">Statistiken</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Prozeduren:</span>
                    <span>{procedures.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Eingriffe total:</span>
                    <span>
                      {procedures.reduce((sum, p) => sum + p.responsible_count + p.instructing_count + p.assistant_count, 0)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Punkte total:</span>
                    <span>{totalWeightedScore.toFixed(1)}</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="procedures" className="mt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Prozedur</TableHead>
                  <TableHead className="text-center">Soll PGY-{userPgyLevel}</TableHead>
                  <TableHead className="text-center">Ist (gewichtet)</TableHead>
                  <TableHead className="text-center">V/I/A</TableHead>
                  <TableHead className="text-center">Fortschritt</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {procedures.map((procedure) => {
                  const required = getRequiredForPgy(procedure);
                  const progress = calculateProgress(procedure);
                  const isUnderTarget = required > 0 && procedure.weighted_score < required;
                  
                  return (
                    <TableRow key={procedure.id}>
                      <TableCell className="font-medium">
                        <div>
                          <div>{procedure.title_de}</div>
                          <div className="text-xs text-muted-foreground">{procedure.code}</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {required || '-'}
                      </TableCell>
                      <TableCell className="text-center">
                        {procedure.weighted_score.toFixed(1)}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex gap-1 justify-center">
                          <Badge variant="default" className="text-xs">
                            {procedure.responsible_count}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {procedure.instructing_count}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {procedure.assistant_count}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {required > 0 ? (
                          <div className="w-16 mx-auto">
                            <Progress value={progress} className="h-2" />
                            <div className="text-xs mt-1">{progress.toFixed(0)}%</div>
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {isUnderTarget && (
                          <AlertTriangle className="w-4 h-4 text-orange-500 mx-auto" />
                        )}
                        {required > 0 && procedure.weighted_score >= required && (
                          <Badge variant="default" className="bg-green-500">✓</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="timeline" className="mt-6">
            <div className="space-y-4">
              {procedures
                .filter(p => p.logs.length > 0)
                .flatMap(p => p.logs.map(log => ({ ...log, procedure_title: p.title_de })))
                .sort((a, b) => new Date(b.performed_date).getTime() - new Date(a.performed_date).getTime())
                .slice(0, 20)
                .map((log) => (
                  <Card key={log.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium">{log.procedure_title}</div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(log.performed_date).toLocaleDateString('de-DE')} • {log.hospital}
                        </div>
                        {log.supervisor && (
                          <div className="text-xs text-muted-foreground">
                            Supervisor: {log.supervisor}
                          </div>
                        )}
                      </div>
                      <Badge 
                        variant={
                          (log.role_in_surgery === 'primary' || log.role_in_surgery === 'responsible') ? 'default' :
                          log.role_in_surgery === 'instructing' ? 'secondary' : 'outline'
                        }
                      >
                        {(log.role_in_surgery === 'primary' || log.role_in_surgery === 'responsible') ? 'Verantwortlich' :
                         log.role_in_surgery === 'instructing' ? 'Instruierend' : 'Assistent'}
                      </Badge>
                    </div>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};