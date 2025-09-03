import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Stethoscope, 
  Plus, 
  Minus, 
  CheckCircle, 
  AlertCircle,
  Target,
  Activity,
  TrendingUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface Procedure {
  id: string;
  code: string;
  title_de: string;
  min_required_by_pgy: Record<string, number>;
  category_id: string;
  active: boolean;
}

interface ProcedureCategory {
  id: string;
  key: string;
  title_de: string;
  minimum_required: number;
  module_type: string;
  sort_index: number;
}

interface ProcedureLog {
  id: string;
  procedure_id: string;
  role_in_surgery: 'primary' | 'instructing' | 'assistant';
  count: number;
}

interface ProcedureProgress {
  procedure: Procedure;
  responsible: number;
  instructing: number;
  assistant: number;
  total: number;
  required: number;
  progress: number;
  status: 'completed' | 'in-progress' | 'not-started';
}

export const FMHProcedureTracking: React.FC = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<ProcedureCategory[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [procedureProgress, setProcedureProgress] = useState<ProcedureProgress[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('basis_notfallchirurgie');
  const [userPgyLevel, setUserPgyLevel] = useState<number>(5);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load user PGY level
      const { data: profile } = await supabase
        .from('profiles')
        .select('pgy_level')
        .eq('user_id', user!.id)
        .single();
      
      if (profile?.pgy_level) {
        setUserPgyLevel(profile.pgy_level);
      }

      // Load categories
      const { data: categoryData } = await supabase
        .from('procedure_categories')
        .select('*')
        .not('module_type', 'is', null)
        .order('sort_index');

      if (categoryData) {
        setCategories(categoryData);
        if (categoryData.length > 0 && !selectedCategory) {
          setSelectedCategory(categoryData[0].key);
        }
      }

      // Load procedures
      const { data: procedureData } = await supabase
        .from('procedures')
        .select('*')
        .eq('active', true)
        .order('code');

      if (procedureData) {
        setProcedures(procedureData);
      }

      // Load procedure logs
      await loadProcedureProgress(procedureData || [], profile?.pgy_level || 5);

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setLoading(false);
    }
  };

  const loadProcedureProgress = async (procedures: Procedure[], pgyLevel: number) => {
    if (!user || procedures.length === 0) return;

    try {
      const { data: logs } = await supabase
        .from('procedure_logs')
        .select('procedure_id, role_in_surgery')
        .eq('user_id', user.id);

      const progressData: ProcedureProgress[] = procedures.map(procedure => {
        const procedureLogs = logs?.filter(log => log.procedure_id === procedure.id) || [];
        
        const responsible = procedureLogs.filter(log => log.role_in_surgery === 'primary').length;
        const instructing = procedureLogs.filter(log => log.role_in_surgery === 'instructing').length;
        const assistant = procedureLogs.filter(log => log.role_in_surgery === 'assistant').length;
        
        const total = responsible + instructing + assistant;
        const required = procedure.min_required_by_pgy[`pgy${pgyLevel}`] || 0;
        const progress = required > 0 ? Math.min((total / required) * 100, 100) : 0;
        
        let status: 'completed' | 'in-progress' | 'not-started' = 'not-started';
        if (total >= required && required > 0) {
          status = 'completed';
        } else if (total > 0) {
          status = 'in-progress';
        }

        return {
          procedure,
          responsible,
          instructing,
          assistant,
          total,
          required,
          progress,
          status
        };
      });

      setProcedureProgress(progressData);
    } catch (error) {
      console.error('Error loading procedure progress:', error);
    }
  };

  const updateProcedureCount = async (procedureId: string, role: 'primary' | 'instructing' | 'assistant', increment: boolean) => {
    if (!user) return;

    try {
      setSaving(true);

      if (increment) {
        // Add new procedure log
        const { error } = await supabase
          .from('procedure_logs')
          .insert({
            user_id: user.id,
            procedure_id: procedureId,
            performed_date: new Date().toISOString().split('T')[0],
            role_in_surgery: role,
            supervisor: 'Dr. Supervisor',
            hospital: 'Klinik',
            case_id: `CASE-${Date.now()}`
          });

        if (error) throw error;
      } else {
        // Remove most recent procedure log for this role
        const { data: logs } = await supabase
          .from('procedure_logs')
          .select('id')
          .eq('user_id', user.id)
          .eq('procedure_id', procedureId)
          .eq('role_in_surgery', role)
          .order('created_at', { ascending: false })
          .limit(1);

        if (logs && logs.length > 0) {
          const { error } = await supabase
            .from('procedure_logs')
            .delete()
            .eq('id', logs[0].id);

          if (error) throw error;
        }
      }

      // Reload data
      await loadData();
      toast.success('Prozedur erfolgreich aktualisiert');

    } catch (error) {
      console.error('Error updating procedure:', error);
      toast.error('Fehler beim Aktualisieren der Prozedur');
    } finally {
      setSaving(false);
    }
  };

  const getCategoryProcedures = (categoryKey: string) => {
    const category = categories.find(c => c.key === categoryKey);
    if (!category) return [];

    return procedureProgress.filter(progress => 
      progress.procedure.category_id === category.id
    );
  };

  const getCategoryProgress = (categoryKey: string) => {
    const categoryProcedures = getCategoryProcedures(categoryKey);
    const totalRequired = categoryProcedures.reduce((sum, p) => sum + p.required, 0);
    const totalCompleted = categoryProcedures.reduce((sum, p) => sum + p.total, 0);
    
    return {
      total: totalCompleted,
      required: totalRequired,
      progress: totalRequired > 0 ? (totalCompleted / totalRequired) * 100 : 0,
      completed: categoryProcedures.filter(p => p.status === 'completed').length,
      totalProcedures: categoryProcedures.length
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-50 border-green-200';
      case 'in-progress': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'in-progress': return <TrendingUp className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-card-foreground">FMH Prozeduren Tracking</h2>
          <p className="text-muted-foreground">Verfolgen Sie Ihre chirurgischen Prozeduren nach FMH-Standards</p>
          <p className="text-sm text-muted-foreground mt-1">Aktueller PGY-Level: {userPgyLevel}</p>
        </div>
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {categories.map(category => {
          const progress = getCategoryProgress(category.key);
          return (
            <Card 
              key={category.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedCategory === category.key ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedCategory(category.key)}
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Stethoscope className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-sm mb-2">{category.title_de}</h3>
                  <div className="space-y-2">
                    <Progress value={progress.progress} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      {progress.completed}/{progress.totalProcedures} abgeschlossen
                    </div>
                    <div className="text-xs font-medium">
                      {progress.total}/{progress.required} Prozeduren
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Procedure Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            {categories.find(c => c.key === selectedCategory)?.title_de}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {getCategoryProcedures(selectedCategory).map(progress => (
                <Card key={progress.procedure.id} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {progress.procedure.code}
                        </Badge>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(progress.status)}`}
                        >
                          {getStatusIcon(progress.status)}
                          <span className="ml-1">
                            {progress.status === 'completed' ? 'Abgeschlossen' : 
                             progress.status === 'in-progress' ? 'In Bearbeitung' : 'Nicht begonnen'}
                          </span>
                        </Badge>
                      </div>
                      <h4 className="font-medium text-card-foreground">
                        {progress.procedure.title_de}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Erforderlich: {progress.required} | Aktuell: {progress.total}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(progress.progress)}%
                      </div>
                      <Progress value={progress.progress} className="w-20 h-2 mt-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <Label className="text-xs text-muted-foreground">Verantwortlich</Label>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateProcedureCount(progress.procedure.id, 'primary', false)}
                          disabled={saving || progress.responsible === 0}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-medium w-8 text-center">{progress.responsible}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateProcedureCount(progress.procedure.id, 'primary', true)}
                          disabled={saving}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-center">
                      <Label className="text-xs text-muted-foreground">Instruierend</Label>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateProcedureCount(progress.procedure.id, 'instructing', false)}
                          disabled={saving || progress.instructing === 0}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-medium w-8 text-center">{progress.instructing}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateProcedureCount(progress.procedure.id, 'instructing', true)}
                          disabled={saving}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="text-center">
                      <Label className="text-xs text-muted-foreground">Assistent</Label>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateProcedureCount(progress.procedure.id, 'assistant', false)}
                          disabled={saving || progress.assistant === 0}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="font-medium w-8 text-center">{progress.assistant}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateProcedureCount(progress.procedure.id, 'assistant', true)}
                          disabled={saving}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
