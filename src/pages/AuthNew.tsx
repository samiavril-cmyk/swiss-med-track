import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { SimpleAuth } from '@/components/SimpleAuth';

export default function AuthNew() {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        console.log('[AuthNew] User already logged in, navigating to /fmh');
        // Use replace to avoid back button issues
        navigate('/fmh', { replace: true });
      }
    };
    checkUser();
  }, [navigate]);

  return <SimpleAuth />;
}
