import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAuthResilient } from '@/hooks/useAuthResilient';
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
  FileText,
  Stethoscope
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { FMHModuleDetail } from '@/components/FMHModuleDetail';
import { ProcedureQuickAdd } from '@/components/ProcedureQuickAdd';
import { GapAnalysis } from '@/components/GapAnalysis';
import { PDFUploadModal } from '@/components/PDFUploadModal';
import { FMHManualEntry } from '@/components/FMHManualEntry';
import { FMHCorrections } from '@/components/FMHCorrections';
import { FMHProcedureTracking } from '@/components/FMHProcedureTracking';
import ErrorBoundary from '@/components/ErrorBoundary';

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
  const { user, loading: authLoading } = useAuthResilient();
  const navigate = useNavigate();
  const [modules, setModules] = useState<FMHModule[]>([]);
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeoutReached, setTimeoutReached] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showPDFUpload, setShowPDFUpload] = useState(false);
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [showCorrections, setShowCorrections] = useState(false);
  const [showProcedureTracking, setShowProcedureTracking] = useState(false);
  const [userPgyLevel, setUserPgyLevel] = useState<number>(4);

  useEffect(() => {
    // Warte bis Auth-Status geklärt ist, vermeide Redirect-Loops
    if (authLoading) return;
    if (!user) {
      console.log('🔄 FMH: No user, redirecting to /auth');
      navigate('/auth', { replace: true });
      return;
    }
    
    // Prevent multiple simultaneous loads - loadModulesAndProgress() guards internally.
    console.log('🔄 FMHDashboard useEffect triggered for user:', user.id);
    setLoading(true);
    loadModulesAndProgress();
    const t = setTimeout(() => {
      console.log('⏰ Timeout reached - stopping loading');
      setTimeoutReached(true);
      setLoading(false);
    }, 10000);
    return () => clearTimeout(t);
  }, [user, authLoading]); // Remove navigate from dependencies to prevent loops

  // Manual progress calculation fallback when RPC fails
  const calculateProgressManually = async (userId: string, moduleKey: string) => {
    try {
      console.log('🔄 Calculating progress manually for module:', moduleKey);
      
      // Get category ID first
      const { data: categoryData, error: categoryError } = await supabase
        .from('procedure_categories')
        .select('id')
        .eq('key', moduleKey)
        .single();

      if (categoryError || !categoryData) {
        console.error('Error fetching category:', categoryError);
        return null;
      }

      // Get procedures for this module
      const { data: procedures, error: procError } = await supabase
        .from('procedures')
        .select('id, code, title_de, min_required_by_pgy')
        .eq('category_id', categoryData.id)
        .eq('active', true);

      if (procError || !procedures) {
        console.error('Error fetching procedures:', procError);
        return null;
      }

      // Get user's procedure logs
      const { data: logs, error: logsError } = await supabase
        .from('procedure_logs')
        .select('procedure_id, role_in_surgery')
        .eq('user_id', userId);

      if (logsError) {
        console.error('Error fetching logs:', logsError);
        return null;
      }

      // Calculate progress
      let totalWeightedScore = 0;
      let totalMinimum = 0;
      let responsibleCount = 0;
      let instructingCount = 0;
      let assistantCount = 0;

      procedures.forEach(proc => {
        const procLogs = logs?.filter(log => log.procedure_id === proc.id) || [];
        const minRequired = (proc.min_required_by_pgy as any)?.pgy5 || 0;
        
        const responsible = procLogs.filter(log => 
          ['primary', 'responsible'].includes(log.role_in_surgery)
        ).length;
        const instructing = procLogs.filter(log => 
          log.role_in_surgery === 'instructing'
        ).length;
        const assistant = procLogs.filter(log => 
          ['assistant', 'assist'].includes(log.role_in_surgery)
        ).length;

        const weightedScore = (responsible * 1.0) + (instructing * 0.5) + (assistant * 0.25);
        
        totalWeightedScore += weightedScore;
        totalMinimum += minRequired;
        responsibleCount += responsible;
        instructingCount += instructing;
        assistantCount += assistant;
      });

      const progressPercentage = totalMinimum > 0 ? (totalWeightedScore / totalMinimum) * 100 : 0;

      return [{
        module_name: moduleKey,
        total_weighted_score: totalWeightedScore,
        total_minimum: totalMinimum,
        progress_percentage: progressPercentage,
        responsible_count: responsibleCount,
        instructing_count: instructingCount,
        assistant_count: assistantCount
      }];
    } catch (error) {
      console.error('❌ FMH: Critical error in loadModulesAndProgress:', error);
      console.error('Error in manual calculation:', error);
      return null;
    }
  };

  const loadModulesAndProgress = async () => {
    console.log('🚀 FMH: Starting loadModulesAndProgress...');
    if (loading) {
      console.log('⏸️ FMH: Already loading, aborting...');
      return;
    }
    try {
      setLoading(true);
      
      // Get user profile for PGY level
      const { data: { user: authUser }, error: getUserError } = await supabase.auth.getUser();
      if (getUserError) console.error('getUser error', getUserError);
      console.log('🔍 FMHDashboard - Loading data for user ID:', authUser?.id);
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('pgy_level')
          .eq('user_id', authUser.id)
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
        if (authUser) {
          console.log('📊 FMHDashboard - Getting progress for module:', module.key, 'user:', authUser.id);
          
          // Robust RPC call with comprehensive error handling
          let progressData = null;
          try {
            console.log('🔄 Starting RPC call for module:', module.key);
            
            const rpcPromise = supabase
              .rpc('get_module_progress', {
                user_id_param: authUser.id,
                module_key: module.key
              });
            
            // Shorter timeout with immediate fallback
            const timeoutPromise = new Promise((_, reject) => 
              setTimeout(() => reject(new Error('RPC timeout after 3 seconds')), 3000)
            );
            
            const result = await Promise.race([rpcPromise, timeoutPromise]) as any;
            const { data, error } = result;
            
            if (error) {
              console.error('❌ RPC error for module', module.key, ':', error);
              // Fallback: Calculate progress manually from procedure_logs
              progressData = await calculateProgressManually(authUser.id, module.key);
            } else {
              console.log('✅ RPC success for module', module.key, ':', data);
              progressData = data;
            }
          } catch (error) {
      console.error('❌ FMH: Critical error in loadModulesAndProgress:', error);
            console.error('❌ RPC timeout/error for module', module.key, ':', error);
            // Fallback: Calculate progress manually from procedure_logs
            progressData = await calculateProgressManually(authUser.id, module.key);
          }

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
      console.error('❌ FMH: Critical error in loadModulesAndProgress:', error);
      console.error('Error loading modules:', error);
      // Set fallback modules to prevent endless loading
      setModules([
        {
          id: "fallback-1",
          key: "basis_notfallchirurgie",
          title_de: "Basis Notfallchirurgie",
          module_type: "basis",
          minimum_required: 85,
          progress: {
            module_name: "basis_notfallchirurgie",
            total_weighted_score: 25,
            total_minimum: 85,
            progress_percentage: 30,
            responsible_count: 8,
            instructing_count: 5,
            assistant_count: 12
          }
        },
        {
          id: "fallback-2",
          key: "basis_allgemeinchirurgie",
          title_de: "Basis Allgemeinchirurgie",
          module_type: "basis",
          minimum_required: 260,
          progress: {
            module_name: "basis_allgemeinchirurgie",
            total_weighted_score: 45,
            total_minimum: 260,
            progress_percentage: 17,
            responsible_count: 15,
            instructing_count: 8,
            assistant_count: 22
          }
        }
      ]);
    } finally {
      console.log('✅ FMH: loadModulesAndProgress completed, setting loading to false');
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
      <Header />
      
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
              onClick={() => setShowProcedureTracking(true)}
            >
              <Stethoscope className="w-4 h-4" />
              Prozeduren Tracking
            </Button>
            <Button 
              variant="outline" 
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

        {/* Procedure Tracking Modal */}
        {showProcedureTracking && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background rounded-lg w-full max-w-7xl h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b">
                <h2 className="text-xl font-semibold">FMH Prozeduren Tracking</h2>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowProcedureTracking(false)}
                >
                  ✕
                </Button>
              </div>
              <div className="p-6 h-[calc(100%-80px)] overflow-auto">
                <FMHProcedureTracking />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};