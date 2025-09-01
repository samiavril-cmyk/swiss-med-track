import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Procedure {
  id: string;
  code: string;
  title_de: string;
  category: {
    title_de: string;
  };
}

interface ProcedureQuickAddProps {
  onClose: () => void;
  onSuccess: () => void;
}

export const ProcedureQuickAdd: React.FC<ProcedureQuickAddProps> = ({ onClose, onSuccess }) => {
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [selectedProcedure, setSelectedProcedure] = useState<string>('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [role, setRole] = useState<string>('');
  const [hospital, setHospital] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [notes, setNotes] = useState('');
  const [caseId, setCaseId] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { toast } = useToast();

  useEffect(() => {
    loadProcedures();
  }, [loadProcedures]);

  const loadProcedures = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('procedures')
        .select(`
          id,
          code,
          title_de,
          procedure_categories!inner(title_de)
        `)
        .eq('active', true)
        .order('title_de');

      if (error) throw error;

      const formattedProcedures = data?.map(proc => ({
        id: proc.id,
        code: proc.code,
        title_de: proc.title_de,
        category: {
          title_de: proc.procedure_categories.title_de
        }
      })) || [];

      setProcedures(formattedProcedures);
    } catch (error) {
      console.error('Error loading procedures:', error);
      toast({
        title: 'Fehler',
        description: 'Prozeduren konnten nicht geladen werden.',
        variant: 'destructive'
      });
    }
  }, [toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProcedure || !date || !role) {
      toast({
        title: 'Fehler',
        description: 'Bitte füllen Sie alle Pflichtfelder aus.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('procedure_logs')
        .insert({
          user_id: user.id,
          procedure_id: selectedProcedure,
          performed_date: date,
          role_in_surgery: role,
          hospital: hospital || null,
          supervisor: supervisor || null,
          notes: notes || null,
          case_id: caseId || null
        });

      if (error) throw error;

      toast({
        title: 'Erfolg',
        description: 'Prozedur wurde erfolgreich erfasst.',
      });

      onSuccess();
    } catch (error) {
      console.error('Error saving procedure:', error);
      toast({
        title: 'Fehler',
        description: 'Prozedur konnte nicht gespeichert werden.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProcedures = procedures.filter(procedure =>
    procedure.title_de.toLowerCase().includes(searchQuery.toLowerCase()) ||
    procedure.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    procedure.category.title_de.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectedProcedureData = procedures.find(p => p.id === selectedProcedure);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Prozedur erfassen
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Procedure Selection */}
          <div className="space-y-2">
            <Label htmlFor="procedure" className="text-sm font-medium">
              Prozedur <span className="text-red-500">*</span>
            </Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedProcedureData ? (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedProcedureData.code}
                      </Badge>
                      <span>{selectedProcedureData.title_de}</span>
                    </div>
                  ) : (
                    "Prozedur auswählen..."
                  )}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0">
                <Command>
                  <CommandInput 
                    placeholder="Prozedur suchen..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandEmpty>Keine Prozedur gefunden.</CommandEmpty>
                  <CommandList>
                    <CommandGroup>
                      {filteredProcedures.map((procedure) => (
                        <CommandItem
                          key={procedure.id}
                          value={`${procedure.code} ${procedure.title_de}`}
                          onSelect={() => {
                            setSelectedProcedure(procedure.id);
                            setOpen(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedProcedure === procedure.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {procedure.code}
                              </Badge>
                              <span>{procedure.title_de}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {procedure.category.title_de}
                            </span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">
                Datum <span className="text-red-500">*</span>
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">
                Rolle <span className="text-red-500">*</span>
              </Label>
              <Select value={role} onValueChange={setRole} required>
                <SelectTrigger>
                  <SelectValue placeholder="Rolle auswählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="responsible">Verantwortlich (1.0x)</SelectItem>
                  <SelectItem value="instructing">Instruierend (0.75x)</SelectItem>
                  <SelectItem value="assistant">Assistent (0.5x)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Hospital */}
            <div className="space-y-2">
              <Label htmlFor="hospital" className="text-sm font-medium">
                Klinik/Spital
              </Label>
              <Input
                id="hospital"
                value={hospital}
                onChange={(e) => setHospital(e.target.value)}
                placeholder="z.B. Universitätsspital Zürich"
              />
            </div>

            {/* Case ID */}
            <div className="space-y-2">
              <Label htmlFor="caseId" className="text-sm font-medium">
                Fall-ID
              </Label>
              <Input
                id="caseId"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                placeholder="z.B. 2024-001234"
              />
            </div>
          </div>

          {/* Supervisor */}
          <div className="space-y-2">
            <Label htmlFor="supervisor" className="text-sm font-medium">
              Supervisor
            </Label>
            <Input
              id="supervisor"
              value={supervisor}
              onChange={(e) => setSupervisor(e.target.value)}
              placeholder="z.B. Dr. med. Max Mustermann"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium">
              Notizen
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Besonderheiten, Komplikationen, Lernpunkte..."
              rows={3}
            />
          </div>

          {/* Weighted Score Info */}
          {role && (
            <div className="p-3 bg-muted rounded-medical">
              <div className="text-sm">
                <strong>Gewichtung:</strong> {' '}
                {role === 'responsible' && '1.0 Punkte (Vollwertung)'}
                {role === 'instructing' && '0.75 Punkte (Instruierend)'}
                {role === 'assistant' && '0.5 Punkte (Assistenz)'}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Speichern...' : 'Speichern'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};