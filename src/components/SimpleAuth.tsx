import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, User, Building, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';

export const SimpleAuth: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('samihosari@me.com');
  const [password, setPassword] = useState('password123');
  const [fullName, setFullName] = useState('');
  const [institution, setInstitution] = useState('');
  const [pgyLevel, setPgyLevel] = useState('1');
  const [error, setError] = useState('');

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('[SimpleAuth] Attempting sign in with:', email);
      console.log('[SimpleAuth] Supabase URL:', supabase.supabaseUrl);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('[SimpleAuth] Auth response:', { data, error });

      if (error) {
        console.error('[SimpleAuth] Sign in error:', error);
        throw error;
      }

      console.log('[SimpleAuth] Sign in successful, user:', data.user?.id);
      toast.success("Anmeldung erfolgreich! Willkommen zurück!");
      
      // Direkte Navigation ohne komplexe Session-Checks
      console.log('[SimpleAuth] Navigating to /dashboard');
      navigate('/dashboard', { replace: true });
      
    } catch (error: unknown) {
      console.error('[SimpleAuth] Sign in error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Anmeldung fehlgeschlagen';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            institution: institution,
            pgy_level: parseInt(pgyLevel),
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        toast.success("Registrierung erfolgreich! Bitte überprüfen Sie Ihre E-Mail für die Bestätigung.");
        
        // If email confirmation is disabled, redirect immediately
        if (data.session) {
          navigate('/dashboard', { replace: true });
        }
      }
    } catch (error: unknown) {
      console.error('Sign up error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Registrierung fehlgeschlagen';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-card-foreground mb-2">
            FMH Tracking
          </h1>
          <p className="text-muted-foreground">
            Melden Sie sich an oder erstellen Sie ein Konto
          </p>
        </div>

        <Card className="medical-card">
          <CardHeader>
            <CardTitle className="text-center">Authentifizierung</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Anmelden</TabsTrigger>
                <TabsTrigger value="signup">Registrieren</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">E-Mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="ihre.email@beispiel.ch"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Passwort</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signin-password"
                        type="password"
                        placeholder="Ihr Passwort"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Anmelden
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Vollständiger Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Dr. Max Mustermann"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">E-Mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="ihre.email@beispiel.ch"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Passwort</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Mindestens 6 Zeichen"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10"
                        required
                        disabled={loading}
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-institution">Institution</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="signup-institution"
                        type="text"
                        placeholder="Universitätsspital Zürich"
                        value={institution}
                        onChange={(e) => setInstitution(e.target.value)}
                        className="pl-10"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-pgy">PGY Level</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <select
                        id="signup-pgy"
                        value={pgyLevel}
                        onChange={(e) => setPgyLevel(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        disabled={loading}
                      >
                        <option value="1">PGY-1</option>
                        <option value="2">PGY-2</option>
                        <option value="3">PGY-3</option>
                        <option value="4">PGY-4</option>
                        <option value="5">PGY-5</option>
                        <option value="6">PGY-6</option>
                        <option value="7">PGY-7</option>
                      </select>
                    </div>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={loading}
                  >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Registrieren
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
