import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AlertTriangle, CheckCircle, Edit, Eye, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModuleData {
  name: string;
  minimum: number;
  responsible: number;
  instructing: number;
  assistant: number;
  total: number;
}

interface StagingProcedure {
  id: string;
  module_name: string;
  proc_name: string;
  minimum: number;
  responsible: number;
  instructing: number;
  assistant: number;
  total: number;
  matched_proc_id: string | null;
  match_confidence: number;
  match_method: string;
  status: string;
  procedures?: { title_de: string };
}

interface PDFImportPreviewProps {
  runId: string;
  summary: {
    filename: string;
    standDate?: string;
    totalProcedures: number;
    modules: ModuleData[];
    matched: number;
    needsReview: number;
  };
  stagingData: StagingProcedure[];
  onClose: () => void;
  onImportComplete: () => void;
}

export const PDFImportPreview: React.FC<PDFImportPreviewProps> = ({
  runId,
  summary,
  stagingData,
  onClose,
  onImportComplete
}) => {
  const [isCommitting, setIsCommitting] = useState(false);
  const [previewMode, setPreviewMode] = useState<'summary' | 'procedures' | 'modules'>('summary');

  const getStatusBadge = (item: StagingProcedure) => {
    switch (item.status) {
      case 'matched':
        return (
          <Badge variant="default" className="bg-success text-success-foreground">
            <CheckCircle className="w-3 h-3 mr-1" />
            {item.match_method === 'exact' ? 'Exakt' : 
             item.match_method === 'alias' ? 'Alias' : 
             item.match_method === 'fuzzy' ? 'Ähnlich' : 'Manuell'}
          </Badge>
        );
      case 'needs_review':
        return (
          <Badge variant="destructive">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Prüfung nötig
          </Badge>
        );
      default:
        return <Badge variant="secondary">Unbekannt</Badge>;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.95) return 'text-success';
    if (confidence >= 0.8) return 'text-warning';
    return 'text-destructive';
  };

  const handleCommitImport = async () => {
    setIsCommitting(true);
    try {
      console.log('🚀 Starting import commit...');
      
      // Only commit matched procedures
      const matchedProcedures = stagingData.filter(item => 
        item.status === 'matched' && item.matched_proc_id
      );
      
      if (matchedProcedures.length === 0) {
        toast.error('Keine passenden Prozeduren zum Importieren gefunden.');
        return;
      }

      // Create procedure logs for matched procedures
      const procedureLogs = [];
      
      for (const proc of matchedProcedures) {
        const baseLog = {
          procedure_id: proc.matched_proc_id,
          performed_date: summary.standDate || new Date().toISOString().split('T')[0],
          hospital: `Importiert aus ${summary.filename}`,
          notes: `PDF Import ${summary.standDate || new Date().toLocaleDateString('de-DE')} - ${proc.module_name}`
        };

        // Create logs for each role with non-zero counts
        if (proc.responsible > 0) {
          for (let i = 0; i < proc.responsible; i++) {
            procedureLogs.push({
              ...baseLog,
              role_in_surgery: 'primary',
              notes: `${baseLog.notes} - Verantwortlich ${i + 1}/${proc.responsible}`
            });
          }
        }

        if (proc.instructing > 0) {
          for (let i = 0; i < proc.instructing; i++) {
            procedureLogs.push({
              ...baseLog,
              role_in_surgery: 'instructing',
              notes: `${baseLog.notes} - Instruierend ${i + 1}/${proc.instructing}`
            });
          }
        }

        if (proc.assistant > 0) {
          for (let i = 0; i < proc.assistant; i++) {
            procedureLogs.push({
              ...baseLog,
              role_in_surgery: 'assistant',
              notes: `${baseLog.notes} - Assistent ${i + 1}/${proc.assistant}`
            });
          }
        }
      }

      console.log(`📝 Creating ${procedureLogs.length} procedure logs...`);

      // Insert procedure logs
      const { error: insertError } = await supabase
        .from('procedure_logs')
        .insert(procedureLogs);

      if (insertError) {
        console.error('❌ Insert error:', insertError);
        throw insertError;
      }

      // Update import run status
      const { error: updateError } = await supabase
        .from('import_runs')
        .update({
          status: 'completed',
          finished_at: new Date().toISOString(),
          summary_json: {
            imported: procedureLogs.length,
            matched: matchedProcedures.length,
            modules: summary.modules.map(m => m.name)
          }
        })
        .eq('id', runId);

      if (updateError) {
        console.error('❌ Update error:', updateError);
        throw updateError;
      }

      console.log('✅ Import completed successfully!');
      toast.success(`Import erfolgreich! ${procedureLogs.length} Einträge wurden importiert.`);
      
      onImportComplete();
      
    } catch (error) {
      console.error('❌ Import failed:', error);
      toast.error(`Import fehlgeschlagen: ${error.message}`);
    } finally {
      setIsCommitting(false);
    }
  };

  const handleDiscardImport = async () => {
    try {
      await supabase
        .from('import_runs')
        .update({ status: 'cancelled' })
        .eq('id', runId);
      
      toast.info('Import wurde abgebrochen.');
      onClose();
    } catch (error) {
      console.error('Error cancelling import:', error);
      toast.error('Fehler beim Abbrechen des Imports.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            PDF Import Vorschau
          </CardTitle>
          <CardDescription>
            Datei: {summary.filename} 
            {summary.standDate && ` • Stand: ${new Date(summary.standDate).toLocaleDateString('de-DE')}`}
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Navigation */}
      <div className="flex gap-2">
        <Button 
          variant={previewMode === 'summary' ? 'default' : 'outline'}
          onClick={() => setPreviewMode('summary')}
        >
          Übersicht
        </Button>
        <Button 
          variant={previewMode === 'modules' ? 'default' : 'outline'}
          onClick={() => setPreviewMode('modules')}
        >
          Module ({summary.modules.length})
        </Button>
        <Button 
          variant={previewMode === 'procedures' ? 'default' : 'outline'}
          onClick={() => setPreviewMode('procedures')}
        >
          Prozeduren ({summary.totalProcedures})
        </Button>
      </div>

      {/* Summary View */}
      {previewMode === 'summary' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Gesamt</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalProcedures}</div>
              <p className="text-muted-foreground">Prozeduren erkannt</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-success">Zugeordnet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{summary.matched}</div>
              <p className="text-muted-foreground">Automatisch zugeordnet</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-warning">Prüfung nötig</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-warning">{summary.needsReview}</div>
              <p className="text-muted-foreground">Manuelle Prüfung</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modules View */}
      {previewMode === 'modules' && (
        <Card>
          <CardHeader>
            <CardTitle>Erkannte Module</CardTitle>
            <CardDescription>Übersicht der aus dem PDF extrahierten Module mit Summen</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Modul</TableHead>
                  <TableHead className="text-right">Minimum</TableHead>
                  <TableHead className="text-right">Verantwortlich</TableHead>
                  <TableHead className="text-right">Instruierend</TableHead>
                  <TableHead className="text-right">Assistent</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {summary.modules.map((module, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{module.name}</TableCell>
                    <TableCell className="text-right">{module.minimum}</TableCell>
                    <TableCell className="text-right">{module.responsible}</TableCell>
                    <TableCell className="text-right">{module.instructing}</TableCell>
                    <TableCell className="text-right">{module.assistant}</TableCell>
                    <TableCell className="text-right font-semibold">{module.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Procedures View */}
      {previewMode === 'procedures' && (
        <Card>
          <CardHeader>
            <CardTitle>Prozeduren Details</CardTitle>
            <CardDescription>Alle erkannten Prozeduren mit Zuordnungsstatus</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Prozedur</TableHead>
                    <TableHead>Modul</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Zugeordnet zu</TableHead>
                    <TableHead className="text-right">V</TableHead>
                    <TableHead className="text-right">I</TableHead>
                    <TableHead className="text-right">A</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stagingData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.proc_name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.module_name}</TableCell>
                      <TableCell>{getStatusBadge(item)}</TableCell>
                      <TableCell>
                        {item.procedures?.title_de ? (
                          <div>
                            <div className="font-medium">{item.procedures.title_de}</div>
                            {item.match_confidence < 1.0 && (
                              <div className={`text-xs ${getConfidenceColor(item.match_confidence)}`}>
                                {(item.match_confidence * 100).toFixed(0)}% Übereinstimmung
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Keine Zuordnung</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{item.responsible}</TableCell>
                      <TableCell className="text-right">{item.instructing}</TableCell>
                      <TableCell className="text-right">{item.assistant}</TableCell>
                      <TableCell className="text-right font-semibold">{item.total}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleDiscardImport}>
          Abbrechen
        </Button>
        
        <div className="flex gap-2">
          {summary.needsReview > 0 && (
            <Button variant="outline" className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              {summary.needsReview} Prozeduren bearbeiten
            </Button>
          )}
          
          <Button 
            onClick={handleCommitImport}
            disabled={isCommitting || summary.matched === 0}
            className="flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            {isCommitting ? 'Importiere...' : `${summary.matched} Prozeduren importieren`}
          </Button>
        </div>
      </div>
    </div>
  );
};