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

interface Procedure {
  id: string;
  title_de: string;
  code: string;
}

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
      { name: 'Weitere zählbare Eingriffe', minimum: 20, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Thoraxchirurgische Eingriffe', minimum: 0, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Urologische Eingriffe', minimum: 0, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Gefässchirurgische Eingriffe', minimum: 0, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Kompartimentelle Spaltungen', minimum: 0, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Diagnostische und therapeutische Endoskopien', minimum: 0, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Mamma-Eingriffe', minimum: 0, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Operation an Nerven', minimum: 0, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 }
    ]
  },
  'viszeralchirurgie': {
    title: 'Modul Viszeralchirurgie',
    totalMinimum: 165,
    totalCount: 0,
    procedures: [
      { name: 'Abdominalhernien (Narbenhernien, videoskopischer Repair)', minimum: 25, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Mageneingriffe (Ulkusnaht, Gastroenterostomie, chir. Gastrostomie, Resektion)', minimum: 7, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Dünndarmeingriffe (Resektion, Adhäsiolyse, Dünndarm-Stomata)', minimum: 25, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Kolorektal (Segment- und Teilresektion)', minimum: 10, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Hepatobiliär (exkl. Cholezystektomie), Leberteilresektion, Pankreasteilresektion, Bariatrische Chirurgie', minimum: 5, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Endokrine Chirurgie (Thyreoidektomie, Parathyreoidektomie, Adrenalektomie)', minimum: 10, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Proktologische Eingriffe (Hämorrhoiden, Fisteln etc.), Rektoskopie und erweiterte Proktologie', minimum: 35, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Splenektomie', minimum: 3, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Dickdarmstoma', minimum: 5, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Laparoskopie, Laparotomie', minimum: 40, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 }
    ]
  },
  'traumatologie': {
    title: 'Modul Traumatologie des Bewegungsapparates',
    totalMinimum: 165,
    totalCount: 0,
    procedures: [
      { name: 'Metallentfernungen, Spickungen', minimum: 30, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Reposition Luxation/Frakturen, konservative Frakturbehandlung', minimum: 25, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Eingriffe Sehnen/Ligamente', minimum: 15, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Arthroskopie', minimum: 10, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Osteosynthese Schaftfrakturen', minimum: 15, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Osteosynthese gelenksnaher (metaphysärer) Frakturen', minimum: 40, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Osteosynthese komplexer Frakturen (intraartikulären Frakturen an den grossen Röhrenknochen und am Mittel- und Rückfuss sowie Becken-/Azetabulumfrakturen)', minimum: 5, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Handchirurgie (exklusiv Wundversorgung)', minimum: 15, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Kleine Amputationen', minimum: 5, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Grosse Amputationen', minimum: 5, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 }
    ]
  },
  'kombination': {
    title: 'Modul Kombination',
    totalMinimum: 165,
    totalCount: 0,
    procedures: [
      { name: 'Abdominalhernien (Narbenhernien, videoskopischer Repair)', minimum: 15, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Mageneingriffe (Ulkusnaht, Gastroenterostomie, chir. Gastrostomie, Resektion)', minimum: 5, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Dünndarmeingriffe (Resektion, Adhäsiolyse, Dünndarm-Stomata)', minimum: 15, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Kolorektal (Segment- und Teilresektion)', minimum: 5, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Endokrine Chirurgie (Thyreoidektomie, Parathyreoidektomie, Adrenalektomie)', minimum: 5, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Proktologische Eingriffe (Hämorrhoiden, Fisteln etc.), Rektoskopie und erweiterte Proktologie', minimum: 20, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Dickdarmstoma', minimum: 5, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Metallentfernungen, Spickungen', minimum: 20, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Reposition Luxation/Frakturen, konservative Frakturbehandlung', minimum: 15, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Eingriffe Sehnen/Ligamente', minimum: 5, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Osteosynthese Schaftfrakturen', minimum: 10, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Osteosynthese gelenksnaher (metaphysärer) Frakturen', minimum: 20, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Handchirurgie (exklusiv Wundversorgung)', minimum: 10, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Laparoskopie, Laparotomie', minimum: 11, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Kleine Amputationen', minimum: 2, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 },
      { name: 'Grosse Amputationen', minimum: 2, verantwortlich: 0, instruierend: 0, assistent: 0, total: 0 }
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
  const [procedures, setProcedures] = useState<Procedure[]>([]);

  // Load procedures from database
  useEffect(() => {
    const loadProcedures = async () => {
      const { data, error } = await supabase
        .from('procedures')
        .select('id, title_de, code')
        .eq('active', true);
      
      if (error) {
        console.error('Error loading procedures:', error);
        return;
      }
      
      setProcedures(data || []);
    };
    
    loadProcedures();
  }, []);

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

  // Synonym mapping for common procedure name variations
  const procedureSynonyms: Record<string, string[]> = {
    'Wundversorgung': ['Wundversorgungen', 'Wundbehandlung', 'Wundrevision'],
    'Thoraxdrainage': ['Thoraxdrainagen', 'Pleuradrainage', 'Thorakale Drainage'],
    'Appendektomie': ['Appendektomie', 'Appendix-Entfernung'],
    'Cholezystektomie': ['Cholezystektomie', 'Gallenblasen-Entfernung'],
    'Hernienoperation': ['Hernienoperationen', 'Hernie-Repair'],
    'Dünndarmeingriff': ['Dünndarmeingriffe', 'Dünndarm-Operation'],
    'Proktologischer Eingriff': ['Proktologische Eingriffe', 'Proktologie'],
    'Veneneingriff': ['Veneneingriffe', 'Venenchirurgie'],
    'Laparoskopie': ['Laparoskopie, Laparotomie', 'Laparoskopische Operation'],
    'Metallentfernung': ['Metallentfernungen, Spickungen', 'ME', 'Implantat-Entfernung'],
    'Osteosynthese': ['Osteosynthese', 'Fraktur-Osteosynthese'],
    'Handchirurgie': ['Handchirurgie (exklusiv Wundversorgung)', 'Hand-Operation'],
    'Amputation': ['Kleine Amputationen', 'Grosse Amputationen', 'Amputation']
  };

  // Find or create procedure by name with improved matching
  const findOrCreateProcedure = async (procedureName: string): Promise<string | null> => {
    console.log(`🔍 Searching for procedure: "${procedureName}"`);
    
    // 1. Exact match (case insensitive)
    let procedure = procedures.find(p => 
      p.title_de.toLowerCase() === procedureName.toLowerCase()
    );
    
    if (procedure) {
      console.log(`✅ Exact match found: ${procedure.title_de} (ID: ${procedure.id})`);
      return procedure.id;
    }

    // 2. Synonym matching
    for (const [baseName, synonyms] of Object.entries(procedureSynonyms)) {
      if (synonyms.some(synonym => 
        synonym.toLowerCase() === procedureName.toLowerCase() ||
        procedureName.toLowerCase().includes(synonym.toLowerCase()) ||
        synonym.toLowerCase().includes(procedureName.toLowerCase())
      )) {
        procedure = procedures.find(p => 
          p.title_de.toLowerCase().includes(baseName.toLowerCase()) ||
          baseName.toLowerCase().includes(p.title_de.toLowerCase())
        );
        
        if (procedure) {
          console.log(`✅ Synonym match found: "${procedureName}" → ${procedure.title_de} (ID: ${procedure.id})`);
          return procedure.id;
        }
      }
    }
    
    // 3. Partial match (contains)
    procedure = procedures.find(p => {
      const pName = p.title_de.toLowerCase();
      const searchName = procedureName.toLowerCase();
      
      // Remove common suffixes/prefixes for better matching
      const cleanSearchName = searchName
        .replace(/eingriffe?$/i, '')
        .replace(/operationen?$/i, '')
        .replace(/^(laparoskopische|offene)\s+/i, '')
        .trim();
      
      const cleanPName = pName
        .replace(/eingriffe?$/i, '')
        .replace(/operationen?$/i, '')
        .replace(/^(laparoskopische|offene)\s+/i, '')
        .trim();
      
      return (
        pName.includes(searchName) ||
        searchName.includes(pName) ||
        cleanPName.includes(cleanSearchName) ||
        cleanSearchName.includes(cleanPName)
      );
    });
    
    if (procedure) {
      console.log(`✅ Partial match found: "${procedureName}" → ${procedure.title_de} (ID: ${procedure.id})`);
      return procedure.id;
    }

    // 4. Try to find procedure category and create with appropriate category_id
    console.log(`⚠️ No match found for "${procedureName}", creating new procedure...`);
    
    try {
      // Get the appropriate category based on context (we'll use a default for now)
      const { data: categories } = await supabase
        .from('procedure_categories')
        .select('id, key')
        .limit(1);

      const categoryId = categories?.[0]?.id || null;

      const { data, error } = await supabase
        .from('procedures')
        .insert({
          title_de: procedureName,
          code: `MANUAL_${Date.now()}`,
          active: true,
          category_id: categoryId
        })
        .select('id')
        .single();
        
      if (error) throw error;
      
      console.log(`✅ Created new procedure: "${procedureName}" (ID: ${data.id})`);
      return data.id;
    } catch (error) {
      console.error(`❌ Error creating procedure "${procedureName}":`, error);
      return null;
    }
  };

  const handleSave = async () => {
    if (!user) {
      toast.error('Sie müssen angemeldet sein um Daten zu speichern');
      return;
    }

    setIsSaving(true);
    console.log('🚀 Starting procedure save process...');
    
    try {
      // Prepare procedure logs for database insertion
      const procedureLogs = [];
      const failedProcedures: string[] = [];
      const successfulProcedures: string[] = [];
      
      for (const [moduleKey, moduleData] of Object.entries(modules)) {
        console.log(`📋 Processing module: ${moduleData.title}`);
        
        for (const procedure of moduleData.procedures) {
          if (procedure.total === 0) continue; // Skip empty procedures
          
          console.log(`📝 Processing procedure: "${procedure.name}" (Total: ${procedure.total})`);
          
          // Find or create procedure ID
          const procedureId = await findOrCreateProcedure(procedure.name);
          if (!procedureId) {
            console.warn(`❌ Could not find or create procedure: ${procedure.name}`);
            failedProcedures.push(procedure.name);
            continue;
          }
          
          successfulProcedures.push(procedure.name);
          
          // Add responsible entries
          for (let i = 0; i < procedure.verantwortlich; i++) {
            procedureLogs.push({
              user_id: user.id,
              procedure_id: procedureId,
              role_in_surgery: 'responsible',
              performed_date: new Date().toISOString().split('T')[0],
              notes: `Manuelle Eingabe - ${moduleData.title}`
            });
          }
          
          // Add instructing entries
          for (let i = 0; i < procedure.instruierend; i++) {
            procedureLogs.push({
              user_id: user.id,
              procedure_id: procedureId,
              role_in_surgery: 'instructing',
              performed_date: new Date().toISOString().split('T')[0],
              notes: `Manuelle Eingabe - ${moduleData.title}`
            });
          }
          
          // Add assistant entries
          for (let i = 0; i < procedure.assistent; i++) {
            procedureLogs.push({
              user_id: user.id,
              procedure_id: procedureId,
              role_in_surgery: 'assistant',
              performed_date: new Date().toISOString().split('T')[0],
              notes: `Manuelle Eingabe - ${moduleData.title}`
            });
          }
        }
      }

      console.log(`📊 Summary: ${procedureLogs.length} procedure logs prepared`);
      console.log(`✅ Successful procedures: ${successfulProcedures.length}`, successfulProcedures);
      if (failedProcedures.length > 0) {
        console.log(`❌ Failed procedures: ${failedProcedures.length}`, failedProcedures);
      }

      if (procedureLogs.length > 0) {
        console.log('💾 Inserting procedure logs into database...');
        
        const { error } = await supabase
          .from('procedure_logs')
          .insert(procedureLogs);

        if (error) {
          console.error('❌ Database insertion error:', error);
          throw error;
        }

        console.log('✅ Successfully inserted procedure logs');

        let message = `${procedureLogs.length} Prozeduren erfolgreich gespeichert`;
        if (failedProcedures.length > 0) {
          message += `. ${failedProcedures.length} Prozeduren konnten nicht verarbeitet werden.`;
        }
        
        toast.success(message);
        
        // Reset form
        setModules(initialModules);
        
        // Call onSuccess callback to refresh FMH progress
        console.log('🔄 Refreshing FMH progress...');
        onSuccess?.();
        onOpenChange(false);
      } else {
        console.log('⚠️ No procedure logs to save');
        toast.warning('Keine Prozeduren zum Speichern gefunden');
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
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex items-center justify-center p-4">
      <Card className="medical-card-elegant w-full max-w-6xl max-h-[90vh] overflow-hidden" style={{ overscrollBehavior: 'contain' }}>
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
          
          {/* Save Button at Top */}
          <div className="mt-4 flex justify-end">
            <Button 
              onClick={handleSave}
              disabled={isSaving || Object.values(modules).every(mod => mod.totalCount === 0)}
              className="gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Speichere...' : 'Prozeduren speichern'}
            </Button>
          </div>
          
          {/* Header Information */}
          <div className="mt-6 bg-primary/5 border-2 border-primary/20 rounded-medical p-4 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-card-foreground">Stand:</span>
                  <span className="font-medium text-card-foreground">{currentDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  <span className="font-medium text-card-foreground">{patientInfo.name} ({patientInfo.id})</span>
                </div>
              </div>
              <Badge variant="default" className="gap-1 bg-primary text-primary-foreground">
                <Stethoscope className="w-3 h-3" />
                {patientInfo.institution}
              </Badge>
            </div>
            <p className="text-sm text-primary/70 font-medium">
              SIWF | ISFM | info@siwf.ch | www.siwf.ch
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-6 overflow-auto max-h-[60vh]" style={{ overscrollBehavior: 'contain' }}>
          <Tabs defaultValue="basis_notfall" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="basis_notfall">Basis Notfallchirurgie</TabsTrigger>
              <TabsTrigger value="basis_allgemein">Basis Allgemeinchirurgie</TabsTrigger>
              <TabsTrigger value="viszeralchirurgie">Modul Viszeralchirurgie</TabsTrigger>
              <TabsTrigger value="traumatologie">Modul Traumatologie</TabsTrigger>
              <TabsTrigger value="kombination">Modul Kombination</TabsTrigger>
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
                        <thead className="border-b border-card-border bg-primary/5">
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
                            <tr key={index} className="border-b border-card-border hover:bg-primary/5 transition-colors">
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
                                     className="w-16 h-8 text-center bg-background border-2 border-primary/20 focus:border-primary font-medium"
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
                                     className="w-16 h-8 text-center bg-background border-2 border-primary/20 focus:border-primary font-medium"
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
                                    className="w-16 h-8 text-center bg-background border-2 border-primary/20 focus:border-primary font-medium"
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