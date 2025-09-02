import React, { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SupabaseAuth } from '@/components/SupabaseAuth';

export default function AuthNew() {
  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.location.href = '/swiss-med-track/fmh';
      }
    };
    checkUser();
  }, []);

  return <SupabaseAuth />;
}
