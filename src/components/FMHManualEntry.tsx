import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Save, 
  X, 
  FileText, 
  Calendar,
  User,
  Stethoscope,
  Plus,
  Minus,
  Loader2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface DbProcedure {
  id: string;
  title_de: string;
  code: string;
  min_required_by_pgy: any;
  category_id: string;
}

interface DbCategory {
  id: string;
  key: string;
  title_de: string;
  minimum_required: number;
}

interface ProcedureEntry {
  id: string;
  name: string;
  minimum: number;
  verantwortlich: number;
  instruierend: number;
  assistent: number;
  total: number;
}

interface ModuleData {
  id: string;
  key: string;
  title: string;
  procedures: ProcedureEntry[];
  totalMinimum: number;
  totalCount: number;
}

interface FMHManualEntryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const FMHManualEntry: React.FC<FMHManualEntryProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { user } = useAuth();
  const [modules, setModules] = useState<Record<string, ModuleData>>({});
  const [savedModules, setSavedModules] = useState<Record<string, ModuleData>>({});
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('de-CH'));
  const [patientInfo, setPatientInfo] = useState({
    name: 'Sami Zacharia Hosari',
    id: '175214',
    institution: 'USZ'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dbProcedures, setDbProcedures] = useState<DbProcedure[]>([]);

  // Load modules and procedures from database
  useEffect(() => {
    if (open) {
      loadModulesAndProcedures();
    }
  }, [open]);

  const loadModulesAndProcedures = async () => {
    setIsLoading(true);
    try {
      // Load categories (modules)
      const { data: categories, error: categoriesError } = await supabase
        .from('procedure_categories')
        .select('*')
        .order('sort_index');

      if (categoriesError) {
        console.error('Error loading categories:', categoriesError);
        toast.error('Fehler beim Laden der Module');
        return;
      }

      // Load procedures
      const { data: procedures, error: proceduresError } = await supabase
        .from('procedures')
        .select('*')
        .eq('active', true)
        .order('code');

      if (proceduresError) {
        console.error('Error loading procedures:', proceduresError);
        toast.error('Fehler beim Laden der Prozeduren');
        return;
      }

      setDbProcedures(procedures || []);

      // Build module structure
      const moduleData: Record<string, ModuleData> = {};
      
      categories?.forEach(category => {
        const categoryProcedures = procedures?.filter(p => p.category_id === category.id) || [];
        
        moduleData[category.key] = {
          id: category.id,
          key: category.key,
          title: category.title_de,
          totalMinimum: category.minimum_required || 0,
          totalCount: 0,
          procedures: categoryProcedures.map(procedure => ({
            id: procedure.id,
            name: procedure.title_de,
            minimum: (procedure.min_required_by_pgy as any)?.PGY5 || 0, // Default to PGY5 requirement
            verantwortlich: 0,
            instruierend: 0,
            assistent: 0,
            total: 0
          }))
        };
      });

      setModules(moduleData);
      setSavedModules(moduleData);
      
      // Load existing data after modules are set
      if (user) {
        await loadExistingData(moduleData);
      }
    } catch (error) {
      console.error('Error loading modules and procedures:', error);
      toast.error('Fehler beim Laden der Daten');
    } finally {
      setIsLoading(false);
    }
  };

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [open]);

  useEffect(() => {
    if (user) {
      // Auto-fill user information if available
      const { user_metadata } = user;
      if (user_metadata?.full_name) {
        setPatientInfo(prev => ({
          ...prev,
          name: user_metadata.full_name,
          institution: user_metadata.institution || 'USZ'
        }));
      }
    }
  }, [user]);

  const loadExistingData = async (moduleData: Record<string, ModuleData>) => {
    if (!user) return;

    try {
      console.log('🔍 FMHManualEntry - Loading data for user ID:', user.id);
      
      // Load existing procedure logs for the user
      const { data: logs, error } = await supabase
        .from('procedure_logs')
        .select(`
          id,
          procedure_id,
          role_in_surgery,
          performed_date
        `)
        .eq('user_id', user.id)
        .gte('performed_date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

      if (error) {
        console.error('Error loading existing data:', error);
        return;
      }

      console.log('📊 FMHManualEntry - Loaded', logs?.length || 0, 'procedure logs for user', user.id);

      // Group logs by procedure ID and count by role
      const procedureCounts: Record<string, { verantwortlich: number; instruierend: number; assistent: number }> = {};
      
      logs?.forEach(log => {
        if (!procedureCounts[log.procedure_id]) {
          procedureCounts[log.procedure_id] = { verantwortlich: 0, instruierend: 0, assistent: 0 };
        }
        
        if (log.role_in_surgery === 'responsible') {
          procedureCounts[log.procedure_id].verantwortlich++;
        } else if (log.role_in_surgery === 'instructing') {
          procedureCounts[log.procedure_id].instruierend++;
        } else if (log.role_in_surgery === 'assistant') {
          procedureCounts[log.procedure_id].assistent++;
        }
      });

      // Update module data with existing counts
      const newSavedModules = { ...moduleData };
      const newCurrentModules = { ...moduleData };
      
      Object.keys(newSavedModules).forEach(moduleKey => {
        newSavedModules[moduleKey].procedures.forEach((procedure, index) => {
          const counts = procedureCounts[procedure.id];
          if (counts) {
            const updatedProcedure = {
              ...procedure,
              verantwortlich: counts.verantwortlich,
              instruierend: counts.instruierend,
              assistent: counts.assistent,
              total: counts.verantwortlich + counts.instruierend + counts.assistent
            };
            
            newSavedModules[moduleKey].procedures[index] = updatedProcedure;
            newCurrentModules[moduleKey].procedures[index] = { ...updatedProcedure };
            
            console.log(`✅ Loaded counts for "${procedure.name}" - V:${counts.verantwortlich} I:${counts.instruierend} A:${counts.assistent}`);
          }
        });
        
        // Update module totals
        newSavedModules[moduleKey].totalCount = newSavedModules[moduleKey].procedures.reduce(
          (sum, proc) => sum + proc.total, 0
        );
        newCurrentModules[moduleKey].totalCount = newCurrentModules[moduleKey].procedures.reduce(
          (sum, proc) => sum + proc.total, 0
        );
      });
      
      setSavedModules(newSavedModules);
      setModules(newCurrentModules);
      
      console.log('✅ Form initialized with existing data');
    } catch (error) {
      console.error('Error loading existing procedure data:', error);
    }
  };

  const updateProcedureValue = (
    moduleKey: string,
    procedureIndex: number,
    field: 'verantwortlich' | 'instruierend' | 'assistent',
    value: number
  ) => {
    setModules(prev => {
      const newModules = { ...prev };
      const procedure = { ...newModules[moduleKey].procedures[procedureIndex] };
      
      procedure[field] = Math.max(0, value);
      procedure.total = procedure.verantwortlich + procedure.instruierend + procedure.assistent;
      
      newModules[moduleKey] = {
        ...newModules[moduleKey],
        procedures: [
          ...newModules[moduleKey].procedures.slice(0, procedureIndex),
          procedure,
          ...newModules[moduleKey].procedures.slice(procedureIndex + 1)
        ]
      };
      
      // Update module total
      newModules[moduleKey].totalCount = newModules[moduleKey].procedures.reduce(
        (sum, proc) => sum + proc.total, 0
      );
      
      return newModules;
    });
  };

  // Find or create procedure by name with improved matching
  const findOrCreateProcedure = async (procedureName: string): Promise<string | null> => {
    console.log(`🔍 Searching for procedure: "${procedureName}"`);
    
    // First try exact match in our loaded procedures
    let matchedProcedure = dbProcedures.find(p => 
      p.title_de.toLowerCase().trim() === procedureName.toLowerCase().trim()
    );
    
    if (matchedProcedure) {
      console.log(`✅ Exact match found: ${matchedProcedure.title_de} (${matchedProcedure.id})`);
      return matchedProcedure.id;
    }
    
    // Try fuzzy match
    const normalizedName = procedureName.toLowerCase().trim();
    
    const fuzzyMatches = dbProcedures.filter(p => {
      const procName = p.title_de.toLowerCase().trim();
      
      // Check if either contains the other (partial match)
      if (procName.includes(normalizedName) || normalizedName.includes(procName)) {
        return true;
      }
      
      return false;
    });
    
    if (fuzzyMatches.length > 0) {
      matchedProcedure = fuzzyMatches[0];
      console.log(`✅ Fuzzy match found: ${matchedProcedure.title_de} (${matchedProcedure.id})`);
      return matchedProcedure.id;
    }
    
    console.log(`❌ No match found for: "${procedureName}"`);
    return null;
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Sie müssen angemeldet sein um Daten zu speichern');
      return;
    }

    setIsSaving(true);
    console.log('🚀 Starting procedure save process...');
    console.log('💾 FMHManualEntry - Saving data for user ID:', user.id);
    
    try {
      // Calculate differences and prepare procedure logs for database insertion/deletion
      const procedureLogsToInsert = [];
      const procedureLogsToDelete = [];
      const failedProcedures: string[] = [];
      const successfulProcedures: string[] = [];
      
      for (const [moduleKey, moduleData] of Object.entries(modules)) {
        console.log(`📋 Processing module: ${moduleData.title}`);
        
        for (let i = 0; i < moduleData.procedures.length; i++) {
          const currentProcedure = moduleData.procedures[i];
          const savedProcedure = savedModules[moduleKey].procedures[i];
          
          // Calculate differences (positive = add, negative = remove)
          const diffVerantwortlich = currentProcedure.verantwortlich - savedProcedure.verantwortlich;
          const diffInstruierend = currentProcedure.instruierend - savedProcedure.instruierend;
          const diffAssistent = currentProcedure.assistent - savedProcedure.assistent;
          
          if (diffVerantwortlich === 0 && diffInstruierend === 0 && diffAssistent === 0) {
            continue; // Skip if no changes
          }
          
          console.log(`📝 Processing procedure: "${currentProcedure.name}" (Changes: V:${diffVerantwortlich} I:${diffInstruierend} A:${diffAssistent})`);
          
          // Use existing procedure ID instead of finding/creating
          const procedureId = currentProcedure.id;
          if (!procedureId) {
            console.warn(`❌ No procedure ID for: ${currentProcedure.name}`);
            failedProcedures.push(currentProcedure.name);
            continue;
          }
          
          successfulProcedures.push(currentProcedure.name);
          
          // Handle additions (positive differences)
          if (diffVerantwortlich > 0) {
            for (let j = 0; j < diffVerantwortlich; j++) {
              procedureLogsToInsert.push({
                user_id: user.id,
                procedure_id: procedureId,
                role_in_surgery: 'responsible',
                performed_date: new Date().toISOString().split('T')[0],
                notes: `Manuelle Eingabe - ${moduleData.title}`
              });
            }
          }
          
          if (diffInstruierend > 0) {
            for (let j = 0; j < diffInstruierend; j++) {
              procedureLogsToInsert.push({
                user_id: user.id,
                procedure_id: procedureId,
                role_in_surgery: 'instructing',
                performed_date: new Date().toISOString().split('T')[0],
                notes: `Manuelle Eingabe - ${moduleData.title}`
              });
            }
          }
          
          if (diffAssistent > 0) {
            for (let j = 0; j < diffAssistent; j++) {
              procedureLogsToInsert.push({
                user_id: user.id,
                procedure_id: procedureId,
                role_in_surgery: 'assistant',
                performed_date: new Date().toISOString().split('T')[0],
                notes: `Manuelle Eingabe - ${moduleData.title}`
              });
            }
          }
          
          // Handle removals (negative differences)
          if (diffVerantwortlich < 0) {
            // Get the most recent logs to delete
            const { data: logsToRemove } = await supabase
              .from('procedure_logs')
              .select('id')
              .eq('user_id', user.id)
              .eq('procedure_id', procedureId)
              .eq('role_in_surgery', 'responsible')
              .order('created_at', { ascending: false })
              .limit(Math.abs(diffVerantwortlich));
            
            if (logsToRemove) {
              procedureLogsToDelete.push(...logsToRemove.map(log => log.id));
            }
          }
          
          // Handle removals for instructing role
          if (diffInstruierend < 0) {
            const { data: logsToRemove } = await supabase
              .from('procedure_logs')
              .select('id')
              .eq('user_id', user.id)
              .eq('procedure_id', procedureId)
              .eq('role_in_surgery', 'instructing')
              .order('created_at', { ascending: false })
              .limit(Math.abs(diffInstruierend));
            
            if (logsToRemove) {
              procedureLogsToDelete.push(...logsToRemove.map(log => log.id));
            }
          }
          
          // Handle removals for assistant role
          if (diffAssistent < 0) {
            const { data: logsToRemove } = await supabase
              .from('procedure_logs')
              .select('id')
              .eq('user_id', user.id)
              .eq('procedure_id', procedureId)
              .eq('role_in_surgery', 'assistant')
              .order('created_at', { ascending: false })
              .limit(Math.abs(diffAssistent));
            
            if (logsToRemove) {
              procedureLogsToDelete.push(...logsToRemove.map(log => log.id));
            }
          }
        }
      }

      console.log(`📊 Summary: ${procedureLogsToInsert.length} logs to insert, ${procedureLogsToDelete.length} logs to delete`);
      console.log(`✅ Successful procedures: ${successfulProcedures.length}`, successfulProcedures);
      if (failedProcedures.length > 0) {
        console.log(`❌ Failed procedures: ${failedProcedures.length}`, failedProcedures);
      }

      // Execute database operations
      let operationsCount = 0;
      
      if (procedureLogsToInsert.length > 0) {
        console.log('💾 Inserting procedure logs into database...');
        
        const { error: insertError } = await supabase
          .from('procedure_logs')
          .insert(procedureLogsToInsert);

        if (insertError) {
          console.error('❌ Database insertion error:', insertError);
          throw insertError;
        }
        
        operationsCount += procedureLogsToInsert.length;
        console.log(`✅ Successfully inserted ${procedureLogsToInsert.length} procedure logs`);
      }
      
      if (procedureLogsToDelete.length > 0) {
        console.log('🗑️ Deleting procedure logs from database...');
        
        const { error: deleteError } = await supabase
          .from('procedure_logs')
          .delete()
          .in('id', procedureLogsToDelete);

        if (deleteError) {
          console.error('❌ Database deletion error:', deleteError);
          throw deleteError;
        }
        
        operationsCount += procedureLogsToDelete.length;
        console.log(`✅ Successfully deleted ${procedureLogsToDelete.length} procedure logs`);
      }

      if (operationsCount > 0) {
        let message = `${operationsCount} Änderungen erfolgreich gespeichert`;
        if (failedProcedures.length > 0) {
          message += `. ${failedProcedures.length} Prozeduren konnten nicht verarbeitet werden.`;
        }
        
        toast.success(message);
        
        // Update saved modules to current state
        setSavedModules({ ...modules });
        
        // Call onSuccess callback to refresh FMH progress
        console.log('🔄 Refreshing FMH progress...');
        onSuccess?.();
        onOpenChange(false);
      } else {
        console.log('⚠️ No changes to save');
        toast.warning('Keine Änderungen zum Speichern gefunden');
      }
    } catch (error) {
      console.error('❌ Error saving procedures:', error);
      const errorMessage = error?.message || error?.toString() || 'Unbekannter Fehler';
      toast.error(`Fehler beim Speichern der Prozeduren: ${errorMessage}`);
    } finally {
      setIsSaving(false);
      console.log('🏁 Save process completed');
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border rounded-lg shadow-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-xl font-semibold">FMH Operationsstatistik</h1>
              <p className="text-sm text-muted-foreground">Manuelle Eingabe der Operationen</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Module und Prozeduren werden geladen...</span>
            </div>
          </div>
        ) : Object.keys(modules).length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Keine Module gefunden</p>
          </div>
        ) : (
        <div className="flex-1 overflow-hidden">
          <div className="p-6 h-full overflow-auto">
            <Tabs defaultValue={Object.keys(modules)[0]} className="w-full h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                {Object.entries(modules).map(([key, module]) => (
                  <TabsTrigger key={key} value={key}>
                    {module.title}
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(modules).map(([moduleKey, moduleData]) => (
                <TabsContent key={moduleKey} value={moduleKey} className="flex-1 mt-0">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{moduleData.title}</CardTitle>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary">
                            Minimum: {moduleData.totalMinimum}
                          </Badge>
                          <Badge variant={moduleData.totalCount >= moduleData.totalMinimum ? "default" : "outline"}>
                            Total: {moduleData.totalCount}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="border-b bg-muted/50">
                            <tr>
                              <th className="text-left p-4 font-medium">Prozedur</th>
                              <th className="text-center p-4 font-medium w-24">Minimum</th>
                              <th className="text-center p-4 font-medium w-32">Verantwortlich</th>
                              <th className="text-center p-4 font-medium w-32">Instruierend</th>
                              <th className="text-center p-4 font-medium w-32">Assistent</th>
                              <th className="text-center p-4 font-medium w-24">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {moduleData.procedures.map((procedure, index) => (
                              <tr key={procedure.id} className="border-b hover:bg-muted/50 transition-colors">
                                <td className="p-4">
                                  <div className="font-medium">{procedure.name}</div>
                                  {savedModules[moduleKey]?.procedures[index]?.total > 0 && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      Gespeichert: V:{savedModules[moduleKey].procedures[index].verantwortlich} I:{savedModules[moduleKey].procedures[index].instruierend} A:{savedModules[moduleKey].procedures[index].assistent}
                                    </div>
                                  )}
                                </td>
                                <td className="text-center p-4">
                                  <Badge variant="outline">{procedure.minimum}</Badge>
                                </td>
                                <td className="text-center p-4">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => updateProcedureValue(moduleKey, index, 'verantwortlich', procedure.verantwortlich - 1)}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={procedure.verantwortlich}
                                      onChange={(e) => updateProcedureValue(moduleKey, index, 'verantwortlich', parseInt(e.target.value) || 0)}
                                      className="w-16 h-8 text-center bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => updateProcedureValue(moduleKey, index, 'verantwortlich', procedure.verantwortlich + 1)}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                                <td className="text-center p-4">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => updateProcedureValue(moduleKey, index, 'instruierend', procedure.instruierend - 1)}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={procedure.instruierend}
                                      onChange={(e) => updateProcedureValue(moduleKey, index, 'instruierend', parseInt(e.target.value) || 0)}
                                      className="w-16 h-8 text-center bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => updateProcedureValue(moduleKey, index, 'instruierend', procedure.instruierend + 1)}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                                <td className="text-center p-4">
                                  <div className="flex items-center justify-center gap-1">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => updateProcedureValue(moduleKey, index, 'assistent', procedure.assistent - 1)}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={procedure.assistent}
                                      onChange={(e) => updateProcedureValue(moduleKey, index, 'assistent', parseInt(e.target.value) || 0)}
                                      className="w-16 h-8 text-center bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-6 w-6 p-0"
                                      onClick={() => updateProcedureValue(moduleKey, index, 'assistent', procedure.assistent + 1)}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                </td>
                                <td className="text-center p-4">
                                  <Badge 
                                    variant={procedure.total >= procedure.minimum ? "default" : "secondary"}
                                    className="font-medium"
                                  >
                                    {procedure.total}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          </div>
          
          {/* Footer */}
          <div className="border-t p-6 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Gesamtanzahl Eingriffe: {Object.values(modules).reduce((sum, mod) => sum + mod.totalCount, 0)}
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
                >
                  Abbrechen
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving || Object.values(modules).every(mod => mod.totalCount === 0)}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? 'Speichere...' : 'Prozeduren speichern'}
                </Button>
              </div>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};