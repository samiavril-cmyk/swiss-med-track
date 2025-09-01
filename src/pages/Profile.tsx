import React, { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { PublicProfile } from '@/components/PublicProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface ProfileData {
  id: string;
  full_name: string;
  institution?: string;
  specialty?: string;
  pgy_level?: number;
  linkedin_url?: string;
  avatar_url?: string;
  public_fields: {
    courses: boolean;
    awards: boolean;
    publications: boolean;
    procedures: boolean;
  };
}

interface ActivityData {
  courses: {
    completed: number;
    total: number;
    mandatory_completed: number;
    mandatory_total: number;
  };
  procedures: {
    completed: number;
    required: number;
  };
  publications: {
    count: number;
    recent: Array<{
      title: string;
      journal?: string;
      publication_date?: string;
      doi?: string;
      link?: string;
    }>;
  };
  awards: Array<{
    title: string;
    organization?: string;
    awarded_date?: string;
  }>;
}

const Profile: React.FC = () => {
  const { handle } = useParams<{ handle: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [activityData, setActivityData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!handle) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('handle', handle)
          .eq('is_public', true)
          .single();

        if (profileError || !profileData) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        setProfile({
          ...profileData,
          public_fields: profileData.public_fields as Record<string, boolean> || {
            courses: true,
            awards: true,
            publications: true,
            procedures: false
          }
        });

        // Fetch activity data
        const currentYear = new Date().getFullYear();
        
        // Fetch courses data
        const { data: courseEnrollments } = await supabase
          .from('course_enrollments')
          .select(`
            status,
            courses (
              is_mandatory
            )
          `)
          .eq('user_id', profileData.user_id);

        const totalCourses = courseEnrollments?.length || 0;
        const completedCourses = courseEnrollments?.filter(e => e.status === 'completed').length || 0;
        const mandatoryCourses = courseEnrollments?.filter(e => e.courses?.is_mandatory).length || 0;
        const completedMandatory = courseEnrollments?.filter(e => e.status === 'completed' && e.courses?.is_mandatory).length || 0;

        // Fetch procedure data
        const { data: procedureLogs } = await supabase
          .from('procedure_logs')
          .select('*')
          .eq('user_id', profileData.user_id)
          .gte('performed_date', `${currentYear}-01-01`)
          .lte('performed_date', `${currentYear}-12-31`);

        // Get required procedures for current PGY level
        const { data: procedures } = await supabase
          .from('procedures')
          .select('min_required_by_pgy')
          .eq('active', true);

        let requiredProcedures = 0;
        if (procedures && profileData.pgy_level) {
          procedures.forEach(proc => {
            const required = proc.min_required_by_pgy?.[profileData.pgy_level.toString()];
            if (required) {
              requiredProcedures += required;
            }
          });
        }

        // Fetch publications
        const { data: publications } = await supabase
          .from('publications')
          .select('*')
          .eq('user_id', profileData.user_id)
          .order('publication_date', { ascending: false })
          .limit(5);

        // Fetch awards
        const { data: awards } = await supabase
          .from('awards')
          .select('*')
          .eq('user_id', profileData.user_id)
          .order('awarded_date', { ascending: false });

        setActivityData({
          courses: {
            completed: completedCourses,
            total: totalCourses,
            mandatory_completed: completedMandatory,
            mandatory_total: mandatoryCourses
          },
          procedures: {
            completed: procedureLogs?.length || 0,
            required: requiredProcedures
          },
          publications: {
            count: publications?.length || 0,
            recent: publications || []
          },
          awards: awards || []
        });

      } catch (error) {
        console.error('Error fetching profile:', error);
        toast({
          title: "Fehler",
          description: "Profil konnte nicht geladen werden.",
          variant: "destructive"
        });
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [handle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-48 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !profile || !activityData) {
    return <Navigate to="/404" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <PublicProfile 
          profile={profile} 
          activityData={activityData} 
        />
      </div>
    </div>
  );
};

export default Profile;