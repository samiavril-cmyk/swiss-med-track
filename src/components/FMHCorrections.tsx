import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2, Edit, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ProcedureLog {
  id: string;
  performed_date: string;
  procedure_id: string;
  procedure_title: string;
  category_key: string;
  category_title: string;
  role_in_surgery: string;
  weighted_score: number;
  notes?: string;
  hospital?: string;
  supervisor?: string;
}

interface FMHCorrectionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const FMHCorrections: React.FC<FMHCorrectionsProps> = ({
  open,
  onOpenChange,
  onSuccess
}) => {
  const { user } = useAuth();
  const [logs, setLogs] = useState<ProcedureLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingLog, setEditingLog] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<ProcedureLog>>({});

  const loadProcedureLogs = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('procedure_logs')
        .select(`
          id,
          performed_date,
          procedure_id,
          role_in_surgery,
          weighted_score,
          notes,
          hospital,
          supervisor,
          procedures (
            title_de,
            category_id,
            procedure_categories (
              key,
              title_de
            )
          )
        `)
        .eq('user_id', user.id)
        .order('performed_date', { ascending: false });

      if (error) throw error;

      const formattedLogs: ProcedureLog[] = (data || []).map(log => ({
        id: log.id,
        performed_date: log.performed_date,
        procedure_id: log.procedure_id,
        procedure_title: log.procedures?.title_de || 'Unknown Procedure',
        category_key: log.procedures?.procedure_categories?.key || 'unknown',
        category_title: log.procedures?.procedure_categories?.title_de || 'Unknown Category',
        role_in_surgery: log.role_in_surgery || 'responsible',
        weighted_score: log.weighted_score || 1,
        notes: log.notes,
        hospital: log.hospital,
        supervisor: log.supervisor
      }));

      setLogs(formattedLogs);
    } catch (error) {
      console.error('Error loading procedure logs:', error);
      toast.error('Fehler beim Laden der Prozedur-Logs');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (open && user) {
      loadProcedureLogs();
    }
  }, [open, user, loadProcedureLogs]);



  const handleEdit = (log: ProcedureLog) => {
    setEditingLog(log.id);
    setEditValues({
      performed_date: log.performed_date,
      role_in_surgery: log.role_in_surgery,
      notes: log.notes,
      hospital: log.hospital,
      supervisor: log.supervisor
    });
  };

  const handleSaveEdit = async (logId: string) => {
    try {
      const { error } = await supabase
        .from('procedure_logs')
        .update({
          performed_date: editValues.performed_date,
          role_in_surgery: editValues.role_in_surgery,
          notes: editValues.notes,
          hospital: editValues.hospital,
          supervisor: editValues.supervisor
        })
        .eq('id', logId);

      if (error) throw error;

      setEditingLog(null);
      setEditValues({});
      await loadProcedureLogs();
      toast.success('Eintrag erfolgreich aktualisiert');
    } catch (error) {
      console.error('Error updating log:', error);
      toast.error('Fehler beim Aktualisieren des Eintrags');
    }
  };

  const handleDelete = async (logId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Eintrag löschen möchten?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('procedure_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;

      await loadProcedureLogs();
      toast.success('Eintrag erfolgreich gelöscht');
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error deleting log:', error);
      toast.error('Fehler beim Löschen des Eintrags');
    }
  };

  const cancelEdit = () => {
    setEditingLog(null);
    setEditValues({});
  };

  const groupedLogs = logs.reduce((acc, log) => {
    const category = log.category_title;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(log);
    return acc;
  }, {} as Record<string, ProcedureLog[]>);

  const getRoleDisplayName = (role: string) => {
    const roleMap = {
      'responsible': 'Verantwortlich',
      'instructing': 'Instruierend', 
      'assistant': 'Assistent'
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  const getRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" | "destructive" => {
    const variantMap: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      'responsible': 'default',
      'instructing': 'secondary',
      'assistant': 'outline'
    };
    return variantMap[role] || 'outline';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Prozedur-Korrekturen</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Tabs defaultValue={Object.keys(groupedLogs)[0]} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-5">
                {Object.keys(groupedLogs).map((category) => (
                  <TabsTrigger key={category} value={category} className="text-xs">
                    {category.replace('Basis ', '').replace('Modul ', '')}
                    <Badge variant="secondary" className="ml-1">
                      {groupedLogs[category].length}
                    </Badge>
                  </TabsTrigger>
                ))}
              </TabsList>

              {Object.entries(groupedLogs).map(([category, categoryLogs]) => (
                <TabsContent key={category} value={category} className="flex-1 overflow-hidden">
                  <div className="overflow-auto h-full">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Datum</TableHead>
                          <TableHead>Prozedur</TableHead>
                          <TableHead>Rolle</TableHead>
                          <TableHead>Score</TableHead>
                          <TableHead>Spital</TableHead>
                          <TableHead>Supervisor</TableHead>
                          <TableHead>Notizen</TableHead>
                          <TableHead>Aktionen</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {categoryLogs.map((log) => (
                          <TableRow key={log.id}>
                            <TableCell>
                              {editingLog === log.id ? (
                                <Input
                                  type="date"
                                  value={editValues.performed_date}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, performed_date: e.target.value }))}
                                  className="w-32"
                                />
                              ) : (
                                new Date(log.performed_date).toLocaleDateString('de-CH')
                              )}
                            </TableCell>
                            <TableCell className="max-w-48">
                              <div className="truncate" title={log.procedure_title}>
                                {log.procedure_title}
                              </div>
                            </TableCell>
                            <TableCell>
                              {editingLog === log.id ? (
                                <select
                                  value={editValues.role_in_surgery}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, role_in_surgery: e.target.value }))}
                                  className="border rounded px-2 py-1"
                                >
                                  <option value="responsible">Verantwortlich</option>
                                  <option value="instructing">Instruierend</option>
                                  <option value="assistant">Assistent</option>
                                </select>
                              ) : (
                                <Badge variant={getRoleBadgeVariant(log.role_in_surgery)}>
                                  {getRoleDisplayName(log.role_in_surgery)}
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{log.weighted_score}</TableCell>
                            <TableCell>
                              {editingLog === log.id ? (
                                <Input
                                  value={editValues.hospital || ''}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, hospital: e.target.value }))}
                                  className="w-24"
                                />
                              ) : (
                                log.hospital || '-'
                              )}
                            </TableCell>
                            <TableCell>
                              {editingLog === log.id ? (
                                <Input
                                  value={editValues.supervisor || ''}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, supervisor: e.target.value }))}
                                  className="w-24"
                                />
                              ) : (
                                log.supervisor || '-'
                              )}
                            </TableCell>
                            <TableCell>
                              {editingLog === log.id ? (
                                <Input
                                  value={editValues.notes || ''}
                                  onChange={(e) => setEditValues(prev => ({ ...prev, notes: e.target.value }))}
                                  className="w-32"
                                />
                              ) : (
                                <div className="max-w-32 truncate" title={log.notes}>
                                  {log.notes || '-'}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {editingLog === log.id ? (
                                  <>
                                    <Button size="sm" onClick={() => handleSaveEdit(log.id)}>
                                      <Save className="h-3 w-3" />
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={cancelEdit}>
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </>
                                ) : (
                                  <>
                                    <Button size="sm" variant="outline" onClick={() => handleEdit(log)}>
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700"
                                      onClick={() => handleDelete(log.id)}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </div>

        <div className="border-t pt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Schließen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};