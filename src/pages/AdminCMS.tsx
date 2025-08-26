import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Settings,
  BookOpen,
  Users,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Course {
  id: string;
  title: string;
  description: string;
  venue: string;
  city: string;
  country: string;
  specialty: string;
  language: string;
  modality: string;
  price: number;
  currency: string;
  difficulty_level: string;
  tags: string[];
  status: string;
  created_at: string;
  updated_at: string;
}

export const AdminCMS: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<Partial<Course>>({});

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      checkAdminAccess();
    }
  }, [user, authLoading, navigate]);

  const checkAdminAccess = async () => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user?.id)
        .single();

      if (profile?.role !== 'admin') {
        toast.error('Zugriff verweigert. Admin-Berechtigung erforderlich.');
        navigate('/');
        return;
      }

      loadCourses();
    } catch (error) {
      console.error('Error checking admin access:', error);
      navigate('/');
    }
  };

  const loadCourses = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error loading courses:', error);
      toast.error('Fehler beim Laden der Kurse');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData(course);
    setShowEditDialog(true);
  };

  const handleCreate = () => {
    setEditingCourse(null);
    setFormData({
      title: '',
      description: '',
      venue: '',
      city: '',
      country: '',
      specialty: '',
      language: 'Deutsch',
      modality: 'onsite',
      price: 0,
      currency: 'EUR',
      difficulty_level: 'beginner',
      tags: [],
      status: 'draft'
    });
    setShowEditDialog(true);
  };

  const handleSave = async () => {
    try {
      if (!user || !formData.title || !formData.venue) {
        toast.error('Titel und Veranstalter sind Pflichtfelder');
        return;
      }

      const courseData = {
        title: formData.title,
        provider_id: user.id,
        description: formData.description || '',
        venue: formData.venue,
        city: formData.city || '',
        country: formData.country || '',
        specialty: formData.specialty || null,
        language: formData.language || 'Deutsch',
        modality: formData.modality || 'onsite',
        price: formData.price || null,
        currency: formData.currency || 'EUR',
        difficulty_level: formData.difficulty_level || 'beginner',
        status: formData.status || 'draft',
        tags: Array.isArray(formData.tags) 
          ? formData.tags 
          : (formData.tags as string)?.split(',').map(tag => tag.trim()) || []
      };

      if (editingCourse) {
        // Update existing course
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);

        if (error) throw error;
        toast.success('Kurs erfolgreich aktualisiert');
      } else {
        // Create new course
        const { error } = await supabase
          .from('courses')
          .insert([courseData]);

        if (error) throw error;
        toast.success('Kurs erfolgreich erstellt');
      }

      setShowEditDialog(false);
      loadCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      toast.error('Fehler beim Speichern des Kurses');
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Sind Sie sicher, dass Sie diesen Kurs löschen möchten?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', courseId);

      if (error) throw error;
      toast.success('Kurs erfolgreich gelöscht');
      loadCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Fehler beim Löschen des Kurses');
    }
  };

  const handleInputChange = (field: keyof Course, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-card-foreground mb-2">
              CMS Administration
            </h1>
            <p className="text-muted-foreground">
              Verwalten Sie Kurse und Inhalte
            </p>
          </div>
          
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Neuen Kurs erstellen
          </Button>
        </div>

        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList>
            <TabsTrigger value="courses" className="gap-2">
              <BookOpen className="h-4 w-4" />
              Kurse
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2">
              <Users className="h-4 w-4" />
              Benutzer
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Settings className="h-4 w-4" />
              Einstellungen
            </TabsTrigger>
          </TabsList>

          <TabsContent value="courses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Kursverwaltung</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Titel</TableHead>
                      <TableHead>Veranstalter</TableHead>
                      <TableHead>Ort</TableHead>
                      <TableHead>Modalität</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Preis</TableHead>
                      <TableHead>Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.map((course) => (
                      <TableRow key={course.id}>
                        <TableCell className="font-medium">{course.title}</TableCell>
                        <TableCell>{course.venue}</TableCell>
                        <TableCell>{course.city}, {course.country}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {course.modality}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={course.status === 'published' ? 'default' : 'secondary'}
                          >
                            {course.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {course.price ? `${course.price} ${course.currency}` : 'k.A.'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(course)}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(course.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Benutzerverwaltung</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Benutzerverwaltung wird in zukünftigen Updates verfügbar sein.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Systemeinstellungen</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Systemeinstellungen werden in zukünftigen Updates verfügbar sein.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit/Create Course Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? 'Kurs bearbeiten' : 'Neuen Kurs erstellen'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titel *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Kurstitel eingeben"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Veranstalter *</Label>
                <Input
                  id="venue"
                  value={formData.venue || ''}
                  onChange={(e) => handleInputChange('venue', e.target.value)}
                  placeholder="Veranstalter eingeben"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">Stadt *</Label>
                <Input
                  id="city"
                  value={formData.city || ''}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="Stadt eingeben"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Land *</Label>
                <Input
                  id="country"
                  value={formData.country || ''}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Land eingeben"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialty">Fachgebiet</Label>
                <Input
                  id="specialty"
                  value={formData.specialty || ''}
                  onChange={(e) => handleInputChange('specialty', e.target.value)}
                  placeholder="Fachgebiet eingeben"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Sprache</Label>
                <Select
                  value={formData.language || 'Deutsch'}
                  onValueChange={(value) => handleInputChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Deutsch">Deutsch</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Français">Français</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="modality">Modalität</Label>
                <Select
                  value={formData.modality || 'onsite'}
                  onValueChange={(value) => handleInputChange('modality', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="onsite">Vor Ort</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                    <SelectItem value="hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty_level">Schwierigkeitsgrad</Label>
                <Select
                  value={formData.difficulty_level || 'beginner'}
                  onValueChange={(value) => handleInputChange('difficulty_level', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Anfänger</SelectItem>
                    <SelectItem value="intermediate">Fortgeschritten</SelectItem>
                    <SelectItem value="advanced">Experte</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Preis</Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price || ''}
                  onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currency">Währung</Label>
                <Select
                  value={formData.currency || 'EUR'}
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="CHF">CHF</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status || 'draft'}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Entwurf</SelectItem>
                    <SelectItem value="published">Veröffentlicht</SelectItem>
                    <SelectItem value="archived">Archiviert</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (kommagetrennt)</Label>
                <Input
                  id="tags"
                  value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags || ''}
                  onChange={(e) => handleInputChange('tags', e.target.value)}
                  placeholder="Tag1, Tag2, Tag3"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Kursbeschreibung eingeben"
                  rows={4}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                <X className="h-4 w-4 mr-2" />
                Abbrechen
              </Button>
              <Button onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Speichern
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};