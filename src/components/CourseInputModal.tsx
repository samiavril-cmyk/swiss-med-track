import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, MapPin, Clock, Star, BookOpen, Plus, Save, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuthResilient } from '@/hooks/useAuthResilient';

interface CourseInputModalProps {
  onCourseAdded?: (course: any) => void;
}

export const CourseInputModal: React.FC<CourseInputModalProps> = ({ onCourseAdded }) => {
  const { user } = useAuthResilient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    duration: '',
    type: 'optional' as 'required' | 'optional',
    status: 'completed' as 'completed' | 'upcoming' | 'in-progress',
    points: 0,
    category: '',
    provider: '',
    certificate_url: ''
  });

  const courseCategories = [
    'Chirurgie',
    'Notfallmedizin',
    'Radiologie',
    'Anästhesie',
    'Innere Medizin',
    'Pädiatrie',
    'Gynäkologie',
    'Orthopädie',
    'Urologie',
    'Dermatologie',
    'Neurologie',
    'Psychiatrie',
    'Ethik',
    'Kommunikation',
    'Forschung',
    'Digital Health',
    'Qualitätsmanagement',
    'Grundlagen',
    'Sonstiges'
  ];

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Sie müssen angemeldet sein, um Kurse hinzuzufügen');
      return;
    }

    setLoading(true);
    try {
      const courseData = {
        ...formData,
        user_id: user.id,
        points: Number(formData.points),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('user_courses')
        .insert([courseData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Kurs erfolgreich hinzugefügt!');
      setOpen(false);
      setFormData({
        title: '',
        description: '',
        date: '',
        location: '',
        duration: '',
        type: 'optional',
        status: 'completed',
        points: 0,
        category: '',
        provider: '',
        certificate_url: ''
      });

      if (onCourseAdded) {
        onCourseAdded(data);
      }
    } catch (error) {
      console.error('Error adding course:', error);
      toast.error('Fehler beim Hinzufügen des Kurses');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Kurs hinzufügen
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Neuen Kurs hinzufügen
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Kurs-Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="z.B. Advanced Laparoscopy Workshop"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategorie *</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategorie wählen" />
                </SelectTrigger>
                <SelectContent>
                  {courseCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Kurze Beschreibung des Kurses..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Datum *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Ort</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="z.B. Zürich"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Dauer</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="z.B. 2 Tage"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Typ *</Label>
              <Select value={formData.type} onValueChange={(value: 'required' | 'optional') => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="required">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      Pflichtkurs
                    </div>
                  </SelectItem>
                  <SelectItem value="optional">Optional</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select value={formData.status} onValueChange={(value: 'completed' | 'upcoming' | 'in-progress') => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completed">Abgeschlossen</SelectItem>
                  <SelectItem value="in-progress">Läuft</SelectItem>
                  <SelectItem value="upcoming">Geplant</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">CME Punkte</Label>
              <Input
                id="points"
                type="number"
                min="0"
                max="50"
                value={formData.points}
                onChange={(e) => handleInputChange('points', Number(e.target.value))}
                placeholder="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="provider">Anbieter</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => handleInputChange('provider', e.target.value)}
                placeholder="z.B. Universitätsspital Zürich"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="certificate_url">Zertifikat URL</Label>
              <Input
                id="certificate_url"
                type="url"
                value={formData.certificate_url}
                onChange={(e) => handleInputChange('certificate_url', e.target.value)}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Preview */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-sm">Vorschau</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {formData.type === 'required' && (
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    )}
                    <h3 className={`font-semibold ${
                      formData.type === 'required' ? 'font-bold' : 'font-medium'
                    }`}>
                      {formData.title || 'Kurs-Titel'}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {formData.category || 'Kategorie'}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {formData.date && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(formData.date).toLocaleDateString('de-DE')}</span>
                      </div>
                    )}
                    {formData.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span>{formData.location}</span>
                      </div>
                    )}
                    {formData.duration && (
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        <span>{formData.duration}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={formData.status === 'completed' ? 'default' : 'outline'}>
                    {formData.status === 'completed' ? 'Abgeschlossen' : 
                     formData.status === 'in-progress' ? 'Läuft' : 'Geplant'}
                  </Badge>
                  {formData.points > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {formData.points} CME
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Abbrechen
            </Button>
            <Button type="submit" disabled={loading || !formData.title || !formData.date}>
              {loading ? (
                <>
                  <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Speichern...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Speichern
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
