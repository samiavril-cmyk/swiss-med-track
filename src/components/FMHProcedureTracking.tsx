import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  Stethoscope, 
  Edit, 
  Trash2,
  Plus,
  Download
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthResilient } from '@/hooks/useAuthResilient';
import { toast } from 'sonner';

interface ProcedureLog {
  id: string;
  procedure_id: string;
  role_in_surgery: string;
  date_performed: string;
  notes: string;
  supervisor_name: string;
  institution: string;
  created_at: string;
  procedure: {
    code: string;
    title_de: string;
    category: {
      title_de: string;
      module_type: string;
    };
  };
}

export const FMHProcedureTracking: React.FC = () => {
  const { user } = useAuthResilient();
  const [logs, setLogs] = useState<ProcedureLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterModule, setFilterModule] = useState<string>('all');
  const [filterDate, setFilterDate] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadProcedureLogs();
    }
  }, [user]);

  const loadProcedureLogs = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('procedure_logs')
        .select(`
          id,
          procedure_id,
          role_in_surgery,
          date_performed,
          notes,
          supervisor_name,
          institution,
          created_at,
          procedure:procedures(
            code,
            title_de,
            category:procedure_categories(
              title_de,
              module_type
            )
          )
        `)
        .eq('user_id', user.id)
        .order('date_performed', { ascending: false });

      if (error) throw error;
      setLogs(data || []);
    } catch (error) {
      console.error('Error loading procedure logs:', error);
      toast.error('Fehler beim Laden der Prozeduren');
    } finally {
      setLoading(false);
    }
  };

  const deleteLog = async (logId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diese Prozedur löschen möchten?')) return;

    try {
      const { error } = await supabase
        .from('procedure_logs')
        .delete()
        .eq('id', logId);

      if (error) throw error;
      
      toast.success('Prozedur gelöscht');
      loadProcedureLogs();
    } catch (error) {
      console.error('Error deleting log:', error);
      toast.error('Fehler beim Löschen der Prozedur');
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'responsible': return 'default';
      case 'instructing': return 'secondary';
      case 'assistant': return 'outline';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'responsible': return 'Verantwortlich';
      case 'instructing': return 'Instruierend';
      case 'assistant': return 'Assistent';
      default: return role;
    }
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.procedure.title_de.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.procedure.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.supervisor_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || log.role_in_surgery === filterRole;
    const matchesModule = filterModule === 'all' || log.procedure.category.module_type === filterModule;
    const matchesDate = !filterDate || log.date_performed.startsWith(filterDate);

    return matchesSearch && matchesRole && matchesModule && matchesDate;
  });

  const exportToCSV = () => {
    const csvContent = [
      ['Datum', 'Prozedur', 'Code', 'Rolle', 'Supervisor', 'Institution', 'Notizen'],
      ...filteredLogs.map(log => [
        log.date_performed,
        log.procedure.title_de,
        log.procedure.code,
        getRoleLabel(log.role_in_surgery),
        log.supervisor_name,
        log.institution,
        log.notes
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fmh-procedures-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
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
          <h2 className="text-2xl font-bold">Prozeduren Tracking</h2>
          <p className="text-muted-foreground">
            Übersicht aller erfassten chirurgischen Eingriffe
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportToCSV} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Gesamt</p>
                <p className="text-2xl font-bold">{logs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Verantwortlich</p>
                <p className="text-2xl font-bold">
                  {logs.filter(l => l.role_in_surgery === 'responsible').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Instruierend</p>
                <p className="text-2xl font-bold">
                  {logs.filter(l => l.role_in_surgery === 'instructing').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-sm text-muted-foreground">Assistent</p>
                <p className="text-2xl font-bold">
                  {logs.filter(l => l.role_in_surgery === 'assistant').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter & Suche</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Suche</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Prozedur, Code, Supervisor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Rolle</label>
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Rollen</SelectItem>
                  <SelectItem value="responsible">Verantwortlich</SelectItem>
                  <SelectItem value="instructing">Instruierend</SelectItem>
                  <SelectItem value="assistant">Assistent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Modul</label>
              <Select value={filterModule} onValueChange={setFilterModule}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Module</SelectItem>
                  <SelectItem value="basis">Basis</SelectItem>
                  <SelectItem value="viszeral">Viszeral</SelectItem>
                  <SelectItem value="trauma">Trauma</SelectItem>
                  <SelectItem value="kombi">Kombination</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Datum</label>
              <Input
                type="month"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {filteredLogs.length === 0 ? (
        <Alert>
          <AlertDescription>
            {logs.length === 0 
              ? 'Noch keine Prozeduren erfasst. Verwenden Sie "Prozedur erfassen" um eine neue Prozedur hinzuzufügen.'
              : 'Keine Prozeduren entsprechen den aktuellen Filtern.'
            }
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              Prozeduren ({filteredLogs.length} von {logs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Datum</TableHead>
                    <TableHead>Prozedur</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Rolle</TableHead>
                    <TableHead>Supervisor</TableHead>
                    <TableHead>Institution</TableHead>
                    <TableHead>Aktionen</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {new Date(log.date_performed).toLocaleDateString('de-CH')}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{log.procedure.title_de}</p>
                          <p className="text-sm text-muted-foreground">
                            {log.procedure.category.title_de}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {log.procedure.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(log.role_in_surgery)}>
                          {getRoleLabel(log.role_in_surgery)}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.supervisor_name || '-'}</TableCell>
                      <TableCell>{log.institution || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteLog(log.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};