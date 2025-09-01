import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Share2, Copy } from 'lucide-react';

interface ProfileSettingsProps {
  userId: string;
}

type PublicFields = {
  courses: boolean;
  awards: boolean;
  publications: boolean;
  procedures: boolean;
};

type ProfileRow = {
  user_id: string;
  full_name?: string | null;
  handle?: string | null;
  is_public?: boolean | null;
  public_fields?: PublicFields | null;
};

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ userId }) => {
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [handle, setHandle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [publicFields, setPublicFields] = useState<PublicFields>({
    courses: true,
    awards: true,
    publications: true,
    procedures: false
  });

  const fetchProfile = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) throw error;

      const p = data as unknown as ProfileRow;
      setProfile(p);
      setHandle(p.handle || '');
      setIsPublic(Boolean(p.is_public));
      setPublicFields((p.public_fields as PublicFields | null) || publicFields);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Fehler",
        description: "Profil konnte nicht geladen werden.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [userId, publicFields]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const generateHandle = () => {
    if (profile?.full_name) {
      const name = profile.full_name.toLowerCase()
        .replace(/ä/g, 'ae')
        .replace(/ö/g, 'oe')
        .replace(/ü/g, 'ue')
        .replace(/ß/g, 'ss')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      setHandle(name);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          handle: handle || null,
          is_public: isPublic,
          public_fields: publicFields
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Gespeichert",
        description: "Deine Profil-Einstellungen wurden aktualisiert."
      });
    } catch (error) {
      const err = error as { code?: string };
      console.error('Error saving profile settings:', error);
      if (err.code === '23505') {
        toast({
          title: "Handle bereits vergeben",
          description: "Dieser Handle ist bereits von einem anderen Nutzer vergeben.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Fehler",
          description: "Die Einstellungen konnten nicht gespeichert werden.",
          variant: "destructive"
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const copyProfileLink = () => {
    if (handle) {
      const link = `${window.location.origin}/profile/${handle}`;
      navigator.clipboard.writeText(link);
      toast({
        title: "Link kopiert",
        description: "Der Link zu deinem öffentlichen Profil wurde kopiert."
      });
    }
  };

  const shareProfile = async () => {
    if (handle) {
      const link = `${window.location.origin}/profile/${handle}`;
      if (navigator.share) {
        await navigator.share({
          title: 'Mein medizinisches Profil',
          text: 'Schau dir mein medizinisches Profil an',
          url: link
        });
      } else {
        copyProfileLink();
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/4"></div>
            <div className="h-10 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-6 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Öffentliches Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Handle Setting */}
          <div className="space-y-2">
            <Label htmlFor="handle">Profil-Handle</Label>
            <div className="flex gap-2">
              <Input
                id="handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="dein-name"
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={generateHandle}
                type="button"
              >
                Generieren
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Dein Handle wird in der URL deines öffentlichen Profils verwendet: /profile/{handle || 'dein-handle'}
            </p>
          </div>

          <Separator />

          {/* Public Visibility */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Profil öffentlich sichtbar</Label>
              <p className="text-sm text-muted-foreground">
                Andere können dein Profil über den Link aufrufen
              </p>
            </div>
            <Switch
              checked={isPublic}
              onCheckedChange={setIsPublic}
            />
          </div>

          {isPublic && (
            <>
              <Separator />

              {/* Visible Fields */}
              <div className="space-y-4">
                <Label>Sichtbare Bereiche</Label>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-normal">Kurse & Weiterbildungen</Label>
                      <p className="text-xs text-muted-foreground">
                        Absolvierte Kurse und CME-Punkte
                      </p>
                    </div>
                    <Switch
                      checked={publicFields.courses}
                      onCheckedChange={(checked) => 
                        setPublicFields(prev => ({ ...prev, courses: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-normal">Auszeichnungen</Label>
                      <p className="text-xs text-muted-foreground">
                        Preise und Ehrungen
                      </p>
                    </div>
                    <Switch
                      checked={publicFields.awards}
                      onCheckedChange={(checked) => 
                        setPublicFields(prev => ({ ...prev, awards: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-normal">Publikationen</Label>
                      <p className="text-xs text-muted-foreground">
                        Veröffentlichte Arbeiten und Papers
                      </p>
                    </div>
                    <Switch
                      checked={publicFields.publications}
                      onCheckedChange={(checked) => 
                        setPublicFields(prev => ({ ...prev, publications: checked }))
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-sm font-normal">OP-Statistiken</Label>
                      <p className="text-xs text-muted-foreground">
                        Anzahl durchgeführter Eingriffe
                      </p>
                    </div>
                    <Switch
                      checked={publicFields.procedures}
                      onCheckedChange={(checked) => 
                        setPublicFields(prev => ({ ...prev, procedures: checked }))
                      }
                    />
                  </div>
                </div>
              </div>

              {handle && (
                <>
                  <Separator />

                  {/* Profile Link Actions */}
                  <div className="space-y-3">
                    <Label>Profil-Link</Label>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={copyProfileLink}
                        className="flex-1"
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Link kopieren
                      </Button>
                      <Button
                        variant="outline"
                        onClick={shareProfile}
                        className="flex-1"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Teilen
                      </Button>
                    </div>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="text-sm text-muted-foreground break-all">
                        {window.location.origin}/profile/{handle}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </>
          )}

          <div className="flex justify-end">
            <Button
              onClick={saveSettings}
              disabled={saving || !handle.trim()}
            >
              {saving ? 'Speichern...' : 'Einstellungen speichern'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};