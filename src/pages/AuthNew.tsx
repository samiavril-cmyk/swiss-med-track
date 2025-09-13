import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SimpleAuth } from '@/components/SimpleAuth';

export default function AuthNew() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in with timeout
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('[AuthNew] User already logged in, navigating to /dashboard');
          // Use replace to avoid back button issues
          navigate('/dashboard', { replace: true });
        }
      } catch (error) {
        console.log('[AuthNew] Session check failed, showing login form');
      }
    };
    
    // Timeout nach 1 Sekunde - verhindert endloses Warten
    const timeout = setTimeout(() => {
      console.log('[AuthNew] Session check timeout - showing login form');
    }, 1000);
    
    checkUser().finally(() => clearTimeout(timeout));
  }, [navigate]);

  return <SimpleAuth />;
}
