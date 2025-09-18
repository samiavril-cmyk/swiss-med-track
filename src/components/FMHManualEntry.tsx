import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, User, Stethoscope, Plus, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthResilient } from '@/hooks/useAuthResilient';
import { toast } from 'sonner';

interface Procedure {
  id: string;
  code: string;
  title_de: string;
  min_required_by_pgy: any;
}

interface ProcedureCategory {
  id: string;
  key: string;
  title_de: string;
  module_type: string;
}

interface ManualEntryData {
  procedure_id: string;
  role_in_surgery: string;
  date_performed: string;
  notes: string;
  supervisor_name: string;
  institution: string;
}

export const FMHManualEntry: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}> = ({ open, onOpenChange, onSuccess }) => {
  const { user } = useAuthResilient();
  const [categories, setCategories] = useState<ProcedureCategory[]>([]);
  const [procedures, setProcedures] = useState<Procedure[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<ManualEntryData>({
    procedure_id: '',
    role_in_surgery: 'responsible',
    date_performed: new Date().toISOString().split('T')[0],
    notes: '',
    supervisor_name: '',
    institution: ''
  });

  // Load categories on mount
  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  // Load procedures when category changes
  useEffect(() => {
    if (selectedCategory) {
      loadProcedures(selectedCategory);
    }
  }, [selectedCategory]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('procedure_categories')
        .select('id, key, title_de, module_type')
        .not('module_type', 'is', null)
        .order('sort_index');

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error loading categories:', error);
      toast.error('Fehler beim Laden der Kategorien');
    } finally {
      setLoading(false);
    }
  };

  const loadProcedures = async (categoryId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('procedures')
        .select('id, code, title_de, min_required_by_pgy')
        .eq('category_id', categoryId)
        .eq('active', true)
        .order('title_de');

      if (error) throw error;
      setProcedures(data || []);
    } catch (error) {
      console.error('Error loading procedures:', error);
      toast.error('Fehler beim Laden der Prozeduren');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      
      const { error } = await supabase
        .from('procedure_logs')
        .insert({
          user_id: user.id,
          procedure_id: formData.procedure_id,
          role_in_surgery: formData.role_in_surgery,
          date_performed: formData.date_performed,
          notes: formData.notes,
          supervisor_name: formData.supervisor_name,
          institution: formData.institution,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Prozedur erfolgreich erfasst!');
      onSuccess();
      onOpenChange(false);
      
      // Reset form
      setFormData({
        procedure_id: '',
        role_in_surgery: 'responsible',
        date_performed: new Date().toISOString().split('T')[0],
        notes: '',
        supervisor_name: '',
        institution: ''
      });
      setSelectedCategory('');
      setProcedures([]);
      
    } catch (error) {
      console.error('Error submitting procedure:', error);
      toast.error('Fehler beim Erfassen der Prozedur');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedProcedure = procedures.find(p => p.id === formData.procedure_id);
  const minRequired = selectedProcedure?.min_required_by_pgy?.pgy5 || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Stethoscope className="w-5 h-5" />
            Manuelle Prozedur-Eingabe
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div className="space-y-2">
            <Label htmlFor="category">FMH Modul</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Wählen Sie ein FMH Modul" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.title_de}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Procedure Selection */}
          {selectedCategory && (
            <div className="space-y-2">
              <Label htmlFor="procedure">Prozedur</Label>
              <Select 
                value={formData.procedure_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, procedure_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wählen Sie eine Prozedur" />
                </SelectTrigger>
                <SelectContent>
                  {procedures.map((procedure) => (
                    <SelectItem key={procedure.id} value={procedure.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{procedure.title_de}</span>
                        <span className="text-xs text-muted-foreground">
                          {procedure.code} • Min: {minRequired}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Procedure Details */}
          {selectedProcedure && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">{selectedProcedure.title_de}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">Code</Label>
                    <p className="font-mono">{selectedProcedure.code}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">Mindestanforderung PGY-5</Label>
                    <p className="font-semibold">{minRequired} Eingriffe</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role">Rolle im Eingriff</Label>
            <Select 
              value={formData.role_in_surgery} 
              onValueChange={(value) => setFormData(prev => ({ ...prev, role_in_surgery: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="responsible">
                  <div className="flex flex-col">
                    <span>Verantwortlich (1.0x Gewichtung)</span>
                    <span className="text-xs text-muted-foreground">Hauptverantwortlicher Chirurg</span>
                  </div>
                </SelectItem>
                <SelectItem value="instructing">
                  <div className="flex flex-col">
                    <span>Instruierend (0.5x Gewichtung)</span>
                    <span className="text-xs text-muted-foreground">Unter Aufsicht</span>
                  </div>
                </SelectItem>
                <SelectItem value="assistant">
                  <div className="flex flex-col">
                    <span>Assistent (0.25x Gewichtung)</span>
                    <span className="text-xs text-muted-foreground">Assistierend</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Datum des Eingriffs</Label>
            <Input
              id="date"
              type="date"
              value={formData.date_performed}
              onChange={(e) => setFormData(prev => ({ ...prev, date_performed: e.target.value }))}
              required
            />
          </div>

          {/* Supervisor */}
          <div className="space-y-2">
            <Label htmlFor="supervisor">Supervisor/Chefarzt</Label>
            <Input
              id="supervisor"
              value={formData.supervisor_name}
              onChange={(e) => setFormData(prev => ({ ...prev, supervisor_name: e.target.value }))}
              placeholder="Dr. Max Mustermann"
            />
          </div>

          {/* Institution */}
          <div className="space-y-2">
            <Label htmlFor="institution">Institution</Label>
            <Input
              id="institution"
              value={formData.institution}
              onChange={(e) => setFormData(prev => ({ ...prev, institution: e.target.value }))}
              placeholder="Universitätsspital Zürich"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen (optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Besondere Umstände, Komplikationen, etc."
              rows={3}
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Abbrechen
            </Button>
            <Button
              type="submit"
              disabled={!formData.procedure_id || submitting}
              className="gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Erfasse...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  Prozedur erfassen
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};