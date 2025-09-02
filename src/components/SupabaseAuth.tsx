import React, { useState } from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export const SupabaseAuth: React.FC = () => {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<'sign_in' | 'sign_up'>('sign_in');

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
            <Auth
              supabaseClient={supabase}
              appearance={{
                theme: ThemeSupa,
                variables: {
                  default: {
                    colors: {
                      brand: 'hsl(var(--primary))',
                      brandAccent: 'hsl(var(--primary-foreground))',
                      inputBackground: 'hsl(var(--background))',
                      inputBorder: 'hsl(var(--border))',
                      inputText: 'hsl(var(--foreground))',
                      messageText: 'hsl(var(--muted-foreground))',
                    },
                  },
                },
                className: {
                  container: 'w-full',
                  button: 'w-full bg-primary text-primary-foreground hover:bg-primary/90',
                  input: 'w-full bg-background border-border text-foreground',
                  label: 'text-foreground',
                  message: 'text-muted-foreground',
                },
              }}
              providers={[]}
              redirectTo={window.location.origin + '/swiss-med-track/fmh'}
              onlyThirdPartyProviders={false}
              view={currentView}
              showLinks={true}
              localization={{
                variables: {
                  sign_in: {
                    email_label: 'E-Mail-Adresse',
                    password_label: 'Passwort',
                    button_label: 'Anmelden',
                    loading_button_label: 'Wird angemeldet...',
                    social_provider_text: 'Mit {{provider}} anmelden',
                    link_text: 'Haben Sie bereits ein Konto? Anmelden',
                    email_input_placeholder: 'Ihre E-Mail-Adresse',
                    password_input_placeholder: 'Ihr Passwort',
                  },
                  sign_up: {
                    email_label: 'E-Mail-Adresse',
                    password_label: 'Passwort',
                    button_label: 'Registrieren',
                    loading_button_label: 'Wird registriert...',
                    social_provider_text: 'Mit {{provider}} registrieren',
                    link_text: 'Noch kein Konto? Registrieren',
                    email_input_placeholder: 'Ihre E-Mail-Adresse',
                    password_input_placeholder: 'Ihr Passwort',
                    confirmation_text: 'Überprüfen Sie Ihre E-Mail für den Bestätigungslink',
                  },
                },
              }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
