import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const SupabaseAuth: React.FC = () => {
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
                    },
                  },
                },
              }}
              providers={[]}
              redirectTo={`${window.location.origin}/swiss-med-track/fmh`}
              onlyThirdPartyProviders={false}
              view="sign_in"
              showLinks={true}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
