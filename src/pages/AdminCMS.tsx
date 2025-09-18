import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAuthResilient } from '@/hooks/useAuthResilient';
import { ImageUpload } from '@/components/ImageUpload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Settings,
  BookOpen,
  Users,
  Calendar as CalendarIcon
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
  price: number | null;
  currency: string;
  difficulty_level: string;
  tags: string[];
  status: string;
  cover_image_url: string | null;
  start_date: string | null;
  end_date: string | null;
  registration_deadline: string | null;
  created_at: string;
  updated_at: string;
}

export const AdminCMS: React.FC = () => {
  const { user, loading: authLoading } = useAuthResilient();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState<Partial<Course>>({});

  // Price formatting utility
  const formatPrice = (price: number | null, currency: string = 'CHF') => {
    if (price === null || price === undefined) {
      return 'k.A.';
    }
    if (price === 0) {
      return 'Kostenlos';
    }
    return `${price} ${currency}`;
  };

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      checkAdminAccess();
    }
  }, [user, authLoading, navigate, checkAdminAccess]);

  const checkAdminAccess = useCallback(async () => {
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
  }, [user?.id, navigate]);

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
      price: null, // Default to price unknown
      currency: 'CHF', // Default currency
      difficulty_level: 'beginner',
      tags: [],
      status: 'draft',
      cover_image_url: null,
      start_date: null,
      end_date: null,
      registration_deadline: null
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
        price: formData.price,
        currency: formData.currency || 'CHF',
        difficulty_level: formData.difficulty_level || 'beginner',
        status: formData.status || 'draft',
        cover_image_url: formData.cover_image_url || null,
        start_date: formData.start_date || null,
        end_date: formData.end_date || null,
        registration_deadline: formData.registration_deadline || null,
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

  const handleInputChange = (field: keyof Course, value: string | number | boolean | null | string[]) => {
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
                          {formatPrice(course.price, course.currency)}
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
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white text-gray-900 border border-gray-200 shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-gray-900">
                {editingCourse ? 'Kurs bearbeiten' : 'Neuen Kurs erstellen'}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Grundinformationen</h3>
                
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-foreground">Titel *</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Kurstitel eingeben"
                    className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="venue" className="text-foreground">Veranstalter *</Label>
                  <Input
                    id="venue"
                    value={formData.venue || ''}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    placeholder="Veranstalter eingeben"
                    className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-foreground">Stadt</Label>
                    <Input
                      id="city"
                      value={formData.city || ''}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="Stadt eingeben"
                      className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-foreground">Land</Label>
                    <Input
                      id="country"
                      value={formData.country || ''}
                      onChange={(e) => handleInputChange('country', e.target.value)}
                      placeholder="Land eingeben"
                      className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description" className="text-foreground">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Kursbeschreibung eingeben"
                    rows={4}
                    className="bg-white text-gray-900 border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Course Details & Dates */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Kursdetails & Termine</h3>
                
                {/* Course Dates */}
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label className="text-foreground">Startdatum</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-background text-foreground border-input",
                            !formData.start_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.start_date ? (
                            format(new Date(formData.start_date), "PPP", { locale: de })
                          ) : (
                            <span>Startdatum wählen</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background border-border" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.start_date ? new Date(formData.start_date) : undefined}
                          onSelect={(date) => handleInputChange('start_date', date?.toISOString())}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Enddatum</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-background text-foreground border-input",
                            !formData.end_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.end_date ? (
                            format(new Date(formData.end_date), "PPP", { locale: de })
                          ) : (
                            <span>Enddatum wählen</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background border-border" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.end_date ? new Date(formData.end_date) : undefined}
                          onSelect={(date) => handleInputChange('end_date', date?.toISOString())}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-foreground">Anmeldeschluss</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal bg-background text-foreground border-input",
                            !formData.registration_deadline && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {formData.registration_deadline ? (
                            format(new Date(formData.registration_deadline), "PPP", { locale: de })
                          ) : (
                            <span>Anmeldeschluss wählen</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-background border-border" align="start">
                        <Calendar
                          mode="single"
                          selected={formData.registration_deadline ? new Date(formData.registration_deadline) : undefined}
                          onSelect={(date) => handleInputChange('registration_deadline', date?.toISOString())}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Course Settings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="specialty" className="text-foreground">Fachgebiet</Label>
                    <Input
                      id="specialty"
                      value={formData.specialty || ''}
                      onChange={(e) => handleInputChange('specialty', e.target.value)}
                      placeholder="Fachgebiet eingeben"
                      className="bg-background text-foreground border-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="language" className="text-foreground">Sprache</Label>
                    <Select
                      value={formData.language || 'Deutsch'}
                      onValueChange={(value) => handleInputChange('language', value)}
                    >
                      <SelectTrigger className="bg-background text-foreground border-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background text-foreground border-border">
                        <SelectItem value="Deutsch">Deutsch</SelectItem>
                        <SelectItem value="English">English</SelectItem>
                        <SelectItem value="Français">Français</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="modality" className="text-foreground">Modalität</Label>
                    <Select
                      value={formData.modality || 'onsite'}
                      onValueChange={(value) => handleInputChange('modality', value)}
                    >
                      <SelectTrigger className="bg-background text-foreground border-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background text-foreground border-border">
                        <SelectItem value="onsite">Vor Ort</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="difficulty_level" className="text-foreground">Schwierigkeitsgrad</Label>
                    <Select
                      value={formData.difficulty_level || 'beginner'}
                      onValueChange={(value) => handleInputChange('difficulty_level', value)}
                    >
                      <SelectTrigger className="bg-background text-foreground border-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background text-foreground border-border">
                        <SelectItem value="beginner">Anfänger</SelectItem>
                        <SelectItem value="intermediate">Fortgeschritten</SelectItem>
                        <SelectItem value="advanced">Experte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Status and Tags */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-foreground">Status</Label>
                    <Select
                      value={formData.status || 'draft'}
                      onValueChange={(value) => handleInputChange('status', value)}
                    >
                      <SelectTrigger className="bg-background text-foreground border-input">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background text-foreground border-border">
                        <SelectItem value="draft">Entwurf</SelectItem>
                        <SelectItem value="published">Veröffentlicht</SelectItem>
                        <SelectItem value="archived">Archiviert</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-foreground">Tags (kommagetrennt)</Label>
                    <Input
                      id="tags"
                      value={Array.isArray(formData.tags) ? formData.tags.join(', ') : formData.tags || ''}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="Tag1, Tag2, Tag3"
                      className="bg-background text-foreground border-input"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload & Price */}
              <div className="md:col-span-2 space-y-6 border-t border-border pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image Upload */}
                  <ImageUpload
                    currentImageUrl={formData.cover_image_url || undefined}
                    onImageUploaded={(url) => handleInputChange('cover_image_url', url)}
                    onImageRemoved={() => handleInputChange('cover_image_url', null)}
                  />

                  {/* Price Section */}
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-foreground">Preis</Label>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <Button
                        type="button"
                        variant={formData.price === 0 ? "default" : "outline"}
                        onClick={() => handleInputChange('price', 0)}
                        className="text-xs"
                      >
                        Kostenlos
                      </Button>
                      <Button
                        type="button"
                        variant={formData.price === null ? "default" : "outline"}
                        onClick={() => handleInputChange('price', null)}
                        className="text-xs"
                      >
                        k.A.
                      </Button>
                      <Button
                        type="button"
                        variant={formData.price && formData.price > 0 ? "default" : "outline"}
                        onClick={() => handleInputChange('price', 1)}
                        className="text-xs"
                      >
                        Kostenpflichtig
                      </Button>
                    </div>
                    
                    {formData.price && formData.price > 0 && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Input
                            type="number"
                            placeholder="Preis eingeben"
                            value={formData.price || ''}
                            onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 1)}
                            className="bg-background text-foreground border-input"
                          />
                        </div>
                        <div>
                          <Select
                            value={formData.currency || 'CHF'}
                            onValueChange={(value) => handleInputChange('currency', value)}
                          >
                            <SelectTrigger className="bg-background text-foreground border-input">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-background text-foreground border-border">
                              <SelectItem value="CHF">CHF</SelectItem>
                              <SelectItem value="EUR">EUR</SelectItem>
                              <SelectItem value="USD">USD</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                    
                    <div className="text-sm text-muted-foreground mt-2">
                      Aktuelle Anzeige: <span className="font-medium">{formatPrice(formData.price, formData.currency)}</span>
                    </div>
                  </div>
                </div>
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