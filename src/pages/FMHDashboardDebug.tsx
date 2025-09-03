import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';

export const FMHDashboardDebug: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/auth');
      return;
    }
    
    loadDebugData();
  }, [user, authLoading, navigate]);

  const loadDebugData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Debug - Starting data load for user:', user?.id);
      
      // Test 1: Basic auth
      const { data: { user: authUser }, error: getUserError } = await supabase.auth.getUser();
      console.log('🔍 Debug - Auth user:', authUser?.id, 'Error:', getUserError);
      
      // Test 2: Load modules
      const { data: moduleData, error: moduleError } = await supabase
        .from('procedure_categories')
        .select('*')
        .not('module_type', 'is', null)
        .order('sort_index');
      
      console.log('🔍 Debug - Modules:', moduleData?.length, 'Error:', moduleError);
      
      // Test 3: Test RPC with timeout
      if (authUser && moduleData && moduleData.length > 0) {
        const firstModule = moduleData[0];
        console.log('🔍 Debug - Testing RPC for module:', firstModule.key);
        
        const rpcPromise = supabase
          .rpc('get_module_progress', {
            user_id_param: authUser.id,
            module_key: firstModule.key
          });
        
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('RPC timeout after 5 seconds')), 5000)
        );
        
        const { data: rpcData, error: rpcError } = await Promise.race([rpcPromise, timeoutPromise]) as any;
        
        console.log('🔍 Debug - RPC result:', rpcData, 'Error:', rpcError);
        
        setDebugInfo({
          authUser: authUser.id,
          modulesCount: moduleData.length,
          firstModule: firstModule.key,
          rpcData,
          rpcError: rpcError?.message
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('🔍 Debug - Error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle>FMH Dashboard Debug - Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Loading debug information...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>FMH Dashboard Debug</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  <strong>Error:</strong> {error}
                </AlertDescription>
              </Alert>
            )}
            
            {debugInfo && (
              <div className="space-y-2">
                <p><strong>Auth User ID:</strong> {debugInfo.authUser}</p>
                <p><strong>Modules Count:</strong> {debugInfo.modulesCount}</p>
                <p><strong>First Module:</strong> {debugInfo.firstModule}</p>
                <p><strong>RPC Data:</strong> {JSON.stringify(debugInfo.rpcData, null, 2)}</p>
                {debugInfo.rpcError && (
                  <p><strong>RPC Error:</strong> {debugInfo.rpcError}</p>
                )}
              </div>
            )}
            
            <Button onClick={loadDebugData} variant="outline">
              Reload Debug Data
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
