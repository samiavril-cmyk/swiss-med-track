import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, TrendingDown, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface GapItem {
  procedure_id: string;
  procedure_title: string;
  procedure_code: string;
  module_name: string;
  required: number;
  current_weighted: number;
  gap: number;
  priority_score: number;
}

interface GapAnalysisProps {
  modules: any[];
  userPgyLevel: number;
}

export const GapAnalysis: React.FC<GapAnalysisProps> = ({ modules, userPgyLevel }) => {
  const [gaps, setGaps] = useState<GapItem[]>([]);
  const [quarterlyProgress, setQuarterlyProgress] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGapAnalysis();
  }, [modules, userPgyLevel]);

  const loadGapAnalysis = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get all procedures with requirements for current PGY level
      const gapAnalysis: GapItem[] = [];

      for (const module of modules) {
        const { data: procedures } = await supabase
          .from('procedures')
          .select(`
            id,
            code,
            title_de,
            min_required_by_pgy
          `)
          .eq('category_id', module.id)
          .eq('active', true);

        for (const proc of procedures || []) {
          const required = proc.min_required_by_pgy?.[userPgyLevel.toString()] || 0;
          
          if (required > 0) {
            // Get user's current performance for this procedure
            const { data: logs } = await supabase
              .from('procedure_logs')
              .select('role_in_surgery, weighted_score')
              .eq('procedure_id', proc.id)
              .eq('user_id', user.id);

            const currentWeighted = logs?.reduce((sum, log) => sum + (log.weighted_score || 0), 0) || 0;
            const gap = Math.max(0, required - currentWeighted);

            if (gap > 0) {
              // Calculate priority score (higher = more urgent)
              const progressPercentage = (currentWeighted / required) * 100;
              const priorityScore = gap * (100 - progressPercentage) / 100;

              gapAnalysis.push({
                procedure_id: proc.id,
                procedure_title: proc.title_de,
                procedure_code: proc.code,
                module_name: module.title_de,
                required,
                current_weighted: currentWeighted,
                gap,
                priority_score: priorityScore
              });
            }
          }
        }
      }

      // Sort by priority (highest gaps first)
      gapAnalysis.sort((a, b) => b.priority_score - a.priority_score);
      setGaps(gapAnalysis.slice(0, 10)); // Top 10 gaps

      // Load quarterly progress for heatmap
      await loadQuarterlyProgress(user.id);
      
    } catch (error) {
      console.error('Error in gap analysis:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuarterlyProgress = async (userId: string) => {
    try {
      // Get last 8 quarters
      const quarters = [];
      const now = new Date();
      
      for (let i = 7; i >= 0; i--) {
        const quarterDate = new Date(now);
        quarterDate.setMonth(quarterDate.getMonth() - (i * 3));
        const year = quarterDate.getFullYear();
        const quarter = Math.floor(quarterDate.getMonth() / 3) + 1;
        
        quarters.push({
          year,
          quarter,
          label: `Q${quarter} ${year}`,
          startDate: new Date(year, (quarter - 1) * 3, 1),
          endDate: new Date(year, quarter * 3, 0)
        });
      }

      const quarterlyData = [];

      for (const quarter of quarters) {
        // Count procedures in this quarter
        const { data: logs } = await supabase
          .from('procedure_logs')
          .select('weighted_score')
          .eq('user_id', userId)
          .gte('performed_date', quarter.startDate.toISOString().split('T')[0])
          .lte('performed_date', quarter.endDate.toISOString().split('T')[0]);

        const totalWeighted = logs?.reduce((sum, log) => sum + (log.weighted_score || 0), 0) || 0;
        const procedureCount = logs?.length || 0;

        quarterlyData.push({
          ...quarter,
          totalWeighted,
          procedureCount,
          intensity: Math.min(100, (procedureCount / 20) * 100) // Normalize for heatmap
        });
      }

      setQuarterlyProgress(quarterlyData);
    } catch (error) {
      console.error('Error loading quarterly progress:', error);
    }
  };

  const getIntensityColor = (intensity: number) => {
    if (intensity === 0) return 'bg-gray-100';
    if (intensity < 25) return 'bg-green-100';
    if (intensity < 50) return 'bg-green-200';
    if (intensity < 75) return 'bg-green-300';
    return 'bg-green-400';
  };

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
    <div className="space-y-6">
      {/* Gap Analysis - Top Priority */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-orange-500" />
            Top Ausbildungslücken
          </CardTitle>
        </CardHeader>
        <CardContent>
          {gaps.length === 0 ? (
            <Alert>
              <AlertDescription>
                Keine größeren Lücken identifiziert. Alle erforderlichen Prozeduren sind auf gutem Weg!
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-4">
              {gaps.slice(0, 5).map((gap, index) => (
                <div key={gap.procedure_id} className="flex items-center justify-between p-4 border border-card-border rounded-medical">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <div>
                        <div className="font-medium">{gap.procedure_title}</div>
                        <div className="text-sm text-muted-foreground">
                          {gap.module_name} • {gap.procedure_code}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right min-w-32">
                    <div className="text-sm font-medium">
                      {gap.current_weighted.toFixed(1)} / {gap.required}
                    </div>
                    <div className="text-xs text-orange-600">
                      Lücke: {gap.gap.toFixed(1)} Punkte
                    </div>
                    <Progress 
                      value={(gap.current_weighted / gap.required) * 100} 
                      className="h-2 mt-1 w-20" 
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quarterly Heatmap */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" />
            Aktivitäts-Heatmap (Quartale)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {quarterlyProgress.map((quarter) => (
              <div
                key={`${quarter.year}-${quarter.quarter}`}
                className={`
                  p-3 rounded-medical border text-center text-xs font-medium
                  ${getIntensityColor(quarter.intensity)}
                  hover:scale-105 transition-transform cursor-pointer
                `}
                title={`${quarter.label}: ${quarter.procedureCount} Eingriffe (${quarter.totalWeighted.toFixed(1)} Punkte)`}
              >
                <div>{quarter.label}</div>
                <div className="text-xs opacity-75 mt-1">
                  {quarter.procedureCount}
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
            <span>Weniger Aktivität</span>
            <div className="flex gap-1">
              <div className="w-3 h-3 bg-gray-100 rounded"></div>
              <div className="w-3 h-3 bg-green-100 rounded"></div>
              <div className="w-3 h-3 bg-green-200 rounded"></div>
              <div className="w-3 h-3 bg-green-300 rounded"></div>
              <div className="w-3 h-3 bg-green-400 rounded"></div>
            </div>
            <span>Mehr Aktivität</span>
          </div>
        </CardContent>
      </Card>

      {/* Role Balance Warning */}
      {modules.length > 0 && (
        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-yellow-500" />
              Rollen-Balance Analyse
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const totalResponsible = modules.reduce((sum, m) => sum + (m.progress?.responsible_count || 0), 0);
              const totalTotal = modules.reduce((sum, m) => 
                sum + (m.progress?.responsible_count || 0) + 
                (m.progress?.instructing_count || 0) + 
                (m.progress?.assistant_count || 0), 0);
              
              const responsiblePercentage = totalTotal > 0 ? (totalResponsible / totalTotal) * 100 : 0;
              
              if (responsiblePercentage >= 30) {
                return (
                  <Alert>
                    <AlertDescription>
                      Ihre Rollen-Balance ist ausgezeichnet! {responsiblePercentage.toFixed(1)}% 
                      Ihrer Eingriffe als Verantwortlicher durchgeführt.
                    </AlertDescription>
                  </Alert>
                );
              } else {
                return (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Achtung: Nur {responsiblePercentage.toFixed(1)}% Ihrer Eingriffe als Verantwortlicher. 
                      Ziel: ≥30% für optimale FMH-Bewertung. 
                      Fokus auf eigenständige Eingriffe empfohlen.
                    </AlertDescription>
                  </Alert>
                );
              }
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
};