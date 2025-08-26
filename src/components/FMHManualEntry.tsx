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
  Minus
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ProcedureEntry {
  name: string;
  minimum: number;
  verantwortlich: number;
  instruierend: number;
  assistent: number;
  total: number;
}

interface ModuleData {
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

const initialModules: Record<string, ModuleData> = {
  'basis_notfall': {
    title: 'Basis Notfallchirurgie',
    totalMinimum: 85,
    totalCount: 0,
    procedures: [
      { name: 'Chirurgisches Schockraummanagement', minimum: 10, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Reposition Luxation/Frakturen, konservative Frakturbehandlung', minimum: 15, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Wundversorgungen', minimum: 30, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Anlage Fixateur externe', minimum: 5, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Thoraxdrainagen', minimum: 15, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Zervikotomien (Tracheafreilegung)', minimum: 5, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Cystofixeinlage', minimum: 5, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 }
    ]
  },
  'basis_allgemein': {
    title: 'Basis Allgemeinchirurgie',
    totalMinimum: 260,
    totalCount: 0,
    procedures: [
      { name: 'Kleinchirurgische Eingriffe (Atherom/Lipom, Kocher, Thiersch, LK Excisionen etc.)', minimum: 40, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Appendektomie', minimum: 30, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Cholezystektomie', minimum: 30, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Hernienoperationen (inguinal/umbilical)', minimum: 40, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Dünndarmeingriffe (Resektion, Adhäsiolyse, Dünndarm-Stomata)', minimum: 20, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Proktologische Eingriffe (Hämorrhoiden, Fisteln etc.), Rektoskopie und erweiterte Proktologie', minimum: 20, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Veneneingriffe (Varizenchirurgie, Port/Pacemaker)', minimum: 30, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Laparoskopie, Laparotomie', minimum: 30, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Weitere zählbare Eingriffe', minimum: 20, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 }
    ]
  },
  'viszeralchirurgie': {
    title: 'Modul Viszeralchirurgie',
    totalMinimum: 165,
    totalCount: 0,
    procedures: [
      { name: 'Abdominalhernien (Narbenhernien, videoskopischer Repair)', minimum: 25, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Endokrine Chirurgie', minimum: 15, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Splenektomie', minimum: 10, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Dickdarmstoma', minimum: 15, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Kolonresektionen', minimum: 25, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Rektumresektionen', minimum: 15, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Ösophaguschirurgie', minimum: 10, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Magenchirurgie', minimum: 20, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Pankreaschirurgie', minimum: 15, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Leberschirurgie', minimum: 15, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 }
    ]
  }
};

export const FMHManualEntry: React.FC<FMHManualEntryProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { user } = useAuth();
  const [modules, setModules] = useState<Record<string, ModuleData>>(initialModules);
  const [currentDate, setCurrentDate] = useState(new Date().toLocaleDateString('de-CH'));
  const [patientInfo, setPatientInfo] = useState({
    name: 'Sami Zacharia Hosari',
    id: '175214',
    institution: 'USZ'
  });
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    if (!user) {
      toast.error('Sie müssen angemeldet sein um Daten zu speichern');
      return;
    }

    setIsSaving(true);
    try {
      // Prepare procedure logs for database insertion
      const procedureLogs = [];
      
      for (const [moduleKey, moduleData] of Object.entries(modules)) {
        for (const procedure of moduleData.procedures) {
          // Add responsible entries
          for (let i = 0; i < procedure.verantwortlich; i++) {
            procedureLogs.push({
              user_id: user.id,
              procedure_name: procedure.name,
              role_in_surgery: 'responsible',
              performed_date: new Date().toISOString().split('T')[0],
              notes: `Manuelle Eingabe - ${moduleData.title}`,
              weighted_score: 1.0 // Will be calculated by trigger
            });
          }
          
          // Add instructing entries
          for (let i = 0; i < procedure.instruierend; i++) {
            procedureLogs.push({
              user_id: user.id,
              procedure_name: procedure.name,
              role_in_surgery: 'instructing',
              performed_date: new Date().toISOString().split('T')[0],
              notes: `Manuelle Eingabe - ${moduleData.title}`,
              weighted_score: 0.8 // Will be calculated by trigger
            });
          }
          
          // Add assistant entries
          for (let i = 0; i < procedure.assistent; i++) {
            procedureLogs.push({
              user_id: user.id,
              procedure_name: procedure.name,
              role_in_surgery: 'assistant',
              performed_date: new Date().toISOString().split('T')[0],
              notes: `Manuelle Eingabe - ${moduleData.title}`,
              weighted_score: 0.5 // Will be calculated by trigger
            });
          }
        }
      }

      if (procedureLogs.length > 0) {
        const { error } = await supabase
          .from('procedure_logs')
          .insert(procedureLogs);

        if (error) throw error;

        toast.success(`${procedureLogs.length} Prozeduren erfolgreich gespeichert`);
        onSuccess?.();
        onOpenChange(false);
        
        // Reset form
        setModules(initialModules);
      } else {
        toast.warning('Keine Prozeduren zum Speichern gefunden');
      }
    } catch (error) {
      console.error('Error saving procedures:', error);
      toast.error('Fehler beim Speichern der Prozeduren');
    } finally {
      setIsSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
      <Card className="medical-card-elegant w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="border-b border-card-border bg-gradient-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-primary/10 rounded-medical">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-medical-title">
                  FMH eLogbuch - Manuelle Eingabe
                </CardTitle>
                <p className="text-medical-subtitle">
                  Erfasste Prozeduren im eLogbuch des Fachgebiets Chirurgie
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onOpenChange(false)}
              className="hover:bg-destructive/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          {/* Header Information */}
          <div className="mt-6 bg-card border border-card-border rounded-medical p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium">Stand:</span>
                  <span>{currentDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span>{patientInfo.name} ({patientInfo.id})</span>
                </div>
              </div>
              <Badge variant="outline" className="gap-1">
                <Stethoscope className="w-3 h-3" />
                {patientInfo.institution}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              SIWF | ISFM | info@siwf.ch | www.siwf.ch
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-auto max-h-[60vh]">
          <Tabs defaultValue="basis_notfall" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basis_notfall">Basis Notfallchirurgie</TabsTrigger>
              <TabsTrigger value="basis_allgemein">Basis Allgemeinchirurgie</TabsTrigger>
              <TabsTrigger value="viszeralchirurgie">Modul Viszeralchirurgie</TabsTrigger>
            </TabsList>

            {Object.entries(modules).map(([moduleKey, moduleData]) => (
              <TabsContent key={moduleKey} value={moduleKey} className="mt-6">
                <Card className="medical-card">
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
                        <thead className="border-b border-card-border bg-muted/50">
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
                            <tr key={index} className="border-b border-card-border hover:bg-muted/30">
                              <td className="p-4">
                                <div className="font-medium">{procedure.name}</div>
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
                                    className="w-16 h-8 text-center"
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
                                    className="w-16 h-8 text-center"
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
                                    className="w-16 h-8 text-center"
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
        </CardContent>

        <div className="border-t border-card-border p-6 bg-gradient-subtle">
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
      </Card>
    </div>
  );
};