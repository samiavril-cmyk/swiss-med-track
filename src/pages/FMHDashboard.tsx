import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/HeaderSimple';
import { useAuth } from '@/hooks/useAuthSimple';
import { ActivityRing } from '@/components/ActivityRing';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  Calendar, 
  Settings, 
  TrendingUp,
  Users,
  Plus,
  Download,
  Upload,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { FMHModuleDetail } from '@/components/FMHModuleDetail';
import { ProcedureQuickAdd } from '@/components/ProcedureQuickAdd';
import { GapAnalysis } from '@/components/GapAnalysis';
import { PDFUploadModal } from '@/components/PDFUploadModal';
import { FMHManualEntry } from '@/components/FMHManualEntry';
import { FMHCorrections } from '@/components/FMHCorrections';

interface ModuleProgress {
  module_name: string;
  total_weighted_score: number;
  total_minimum: number;
  progress_percentage: number;
  responsible_count: number;
  instructing_count: number;
  assistant_count: number;
}

interface FMHModule {
  id: string;
  key: string;
  title_de: string;
  module_type: string;
  minimum_required: number;
  progress: ModuleProgress | null;
}

export const FMHDashboard: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [modules, setModules] = useState<FMHModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showPDFUpload, setShowPDFUpload] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showCorrections, setShowCorrections] = useState(false);
  const [userPgyLevel, setUserPgyLevel] = useState<number>(4);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    if (user) {
      loadModulesAndProgress();
    }
  }, [user, authLoading, navigate]);

  const loadModulesAndProgress = async () => {
    try {
      setLoading(true);
      
      // Get user profile for PGY level
      const { data: { user } } = await supabase.auth.getUser();
      console.log('🔍 FMHDashboard - Loading data for user ID:', user?.id);
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('pgy_level')
          .eq('user_id', user.id)
          .single();
        
        if (profile?.pgy_level) {
          setUserPgyLevel(profile.pgy_level);
        }
      }

      // Load FMH modules
      const { data: moduleData, error: moduleError } = await supabase
        .from('procedure_categories')
        .select('*')
        .not('module_type', 'is', null)
        .order('sort_index');

      if (moduleError) throw moduleError;

      const modulesWithProgress: FMHModule[] = [];

      for (const module of moduleData || []) {
        if (user) {
          console.log('📊 FMHDashboard - Getting progress for module:', module.key, 'user:', user.id);
          const { data: progressData } = await supabase
            .rpc('get_module_progress', {
              user_id_param: user.id,
              module_key: module.key
            });

          console.log('📈 Progress data for', module.key, ':', progressData);
          console.log('🔍 Module data:', { 
            key: module.key, 
            title: module.title_de, 
            minimum_required: module.minimum_required,
            progress_raw: progressData 
          });

          // Parse RPC tuple return to object format
          let progress = null;
          if (progressData && progressData.length > 0) {
            const row = progressData[0];
            if (Array.isArray(row) && row.length >= 7) {
              // RPC returns: [module_name, total_weighted_score, total_minimum, progress_percentage, responsible_count, instructing_count, assistant_count]
              progress = {
                module_name: row[0],
                total_weighted_score: row[1],
                total_minimum: row[2], 
                progress_percentage: row[3],
                responsible_count: row[4],
                instructing_count: row[5],
                assistant_count: row[6]
              };
            } else if (typeof row === 'object' && row !== null) {
              // If already an object, use as is
              progress = row;
            }
          }

          modulesWithProgress.push({
            ...module,
            progress
          });
        } else {
          modulesWithProgress.push({
            ...module,
            progress: null
          });
        }
      }

      setModules(modulesWithProgress);
    } catch (error) {
      console.error('Error loading modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const getModuleVariant = (moduleKey: string) => {
    const variants = {
      'basis_notfallchirurgie': 'coral' as const,
      'basis_allgemeinchirurgie': 'mint' as const, 
      'viszeralchirurgie': 'lavender' as const,
      'traumatologie': 'amber' as const,
      'kombination': 'coral' as const
    };
    return variants[moduleKey as keyof typeof variants] || 'mint';
  };

  const getRoleBalanceStatus = () => {
    const totalResponsible = modules.reduce((sum, m) => sum + (m.progress?.responsible_count || 0), 0);
    const totalProcedures = modules.reduce((sum, m) => 
      sum + (m.progress?.responsible_count || 0) + 
      (m.progress?.instructing_count || 0) + 
      (m.progress?.assistant_count || 0), 0);
    
    const responsiblePercentage = totalProcedures > 0 ? (totalResponsible / totalProcedures) * 100 : 0;
    
    if (responsiblePercentage >= 30) return { status: 'good', color: 'bg-green-500' };
    if (responsiblePercentage >= 20) return { status: 'warning', color: 'bg-yellow-500' };
    return { status: 'critical', color: 'bg-red-500' };
  };

  const roleBalance = getRoleBalanceStatus();

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedHeader />
      
      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-medical-title text-card-foreground mb-2">
              FMH Chirurgie Tracking
            </h1>
            <p className="text-medical-subtitle">
              Überwachung Ihres FMH-konformen Ausbildungsfortschritts - PGY {userPgyLevel}
            </p>
            {user && (
              <p className="text-xs text-muted-foreground mt-1">
                Debug: User ID: {user.id} | Email: {user.email}
              </p>
            )}
          </div>
          
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button 
              variant="default" 
              size="sm" 
              className="gap-2"
              onClick={() => setShowQuickAdd(true)}
            >
              <Plus className="w-4 h-4" />
              Prozedur erfassen
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setShowManualEntry(true)}
            >
              <FileText className="w-4 h-4" />
              Manual eingabe
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setShowPDFUpload(true)}
            >
              <Upload className="w-4 h-4" />
              PDF Upload
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowCorrections(true)}>
              <Settings className="w-4 h-4" />
              Korrekturen
            </Button>
          </div>
        </div>

        {/* FMH Module Rings */}
        <div className="medical-card-elegant p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-card-foreground mb-2">
              FMH Module Progress
            </h2>
            <p className="text-text-secondary">
              Gewichtete Erfüllung der FMH-Mindestanforderungen pro Modul
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 justify-items-center">
            {modules.map((module) => {
              const progress = module.progress?.progress_percentage || 0;
              
              return (
                <div key={module.id} className="flex flex-col items-center">
                  <ActivityRing
                    progress={progress}
                    variant={getModuleVariant(module.key)}
                    size={120}
                    strokeWidth={8}
                    label={module.title_de}
                    showPercentage
                    onClick={() => setSelectedModule(module.key)}
                    className="mb-3 transform transition-all duration-300 hover:scale-110 cursor-pointer"
                  />
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Activity className="w-4 h-4 text-muted-foreground" />
                      <Badge variant="outline" className="text-xs">
                        {parseInt((module.progress?.total_weighted_score || 0).toString())}/{module.minimum_required || '?'}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      V:{parseInt((module.progress?.responsible_count || 0).toString())} I:{parseInt((module.progress?.instructing_count || 0).toString())} A:{parseInt((module.progress?.assistant_count || 0).toString())}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module Detail View */}
        {selectedModule && (
          <FMHModuleDetail
            moduleKey={selectedModule}
            onClose={() => setSelectedModule(null)}
          />
        )}

        {/* Key Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="medical-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-activity-mint/20 rounded-medical">
                <TrendingUp className="w-6 h-6 text-activity-mint" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Gesamtfortschritt</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {modules.length > 0 
                    ? parseInt((modules.reduce((sum, m) => sum + (m.progress?.progress_percentage || 0), 0) / modules.length).toString())
                    : 0}%
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="medical-card p-6">
            <div className="flex items-center gap-4">
              <div className={`p-3 ${roleBalance.color}/20 rounded-medical`}>
                <Users className="w-6 h-6" style={{ color: roleBalance.color.replace('/20', '').replace('bg-', '') }} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rollen-Balance</p>
                <p className="text-2xl font-bold text-card-foreground capitalize">
                  {roleBalance.status === 'good' ? 'Gut' : roleBalance.status === 'warning' ? 'Achtung' : 'Kritisch'}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="medical-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-activity-coral/20 rounded-medical">
                <Activity className="w-6 h-6 text-activity-coral" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Eingriffe Total</p>
                <p className="text-2xl font-bold text-card-foreground">
                  {parseInt(modules.reduce((sum, m) => 
                    sum + (m.progress?.responsible_count || 0) + 
                    (m.progress?.instructing_count || 0) + 
                    (m.progress?.assistant_count || 0), 0).toString())}
                </p>
              </div>
            </div>
          </Card>
          
          <Card className="medical-card p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-activity-amber/20 rounded-medical">
                <Calendar className="w-6 h-6 text-activity-amber" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktueller PGY</p>
                <p className="text-2xl font-bold text-card-foreground">PGY-{userPgyLevel}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Gap Analysis */}
        <GapAnalysis modules={modules} userPgyLevel={userPgyLevel} />

        {/* Quick Add Modal */}
        {showQuickAdd && (
          <ProcedureQuickAdd
            onClose={() => setShowQuickAdd(false)}
            onSuccess={() => {
              setShowQuickAdd(false);
              loadModulesAndProgress();
            }}
          />
        )}

        {/* Manual Entry Modal */}
        <FMHManualEntry
          open={showManualEntry}
          onOpenChange={setShowManualEntry}
          onSuccess={loadModulesAndProgress}
        />

        {/* PDF Upload Modal */}
        <PDFUploadModal
          open={showPDFUpload}
          onOpenChange={setShowPDFUpload}
          onSuccess={loadModulesAndProgress}
        />

        {/* Corrections Modal */}
        <FMHCorrections
          open={showCorrections}
          onOpenChange={setShowCorrections}
          onSuccess={loadModulesAndProgress}
        />
      </main>
    </div>
  );
};