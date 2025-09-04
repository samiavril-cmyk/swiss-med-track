-- Supervisor System Implementation
-- Add supervisor functionality to track resident progress

-- Add supervisor fields to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES public.profiles(user_id);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'resident' CHECK (role IN ('resident', 'supervisor', 'admin'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS department TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS hospital TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS team_name TEXT;

-- Create supervisor_teams table for team management
CREATE TABLE IF NOT EXISTS public.supervisor_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supervisor_id UUID NOT NULL REFERENCES public.profiles(user_id),
  team_name TEXT NOT NULL,
  department TEXT,
  hospital TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create team_members table for resident-supervisor relationships
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.supervisor_teams(id) ON DELETE CASCADE,
  resident_id UUID NOT NULL REFERENCES public.profiles(user_id),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'graduated')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, resident_id)
);

-- Create supervisor_reports table for progress tracking
CREATE TABLE IF NOT EXISTS public.supervisor_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supervisor_id UUID NOT NULL REFERENCES public.profiles(user_id),
  resident_id UUID NOT NULL REFERENCES public.profiles(user_id),
  report_period_start DATE NOT NULL,
  report_period_end DATE NOT NULL,
  total_procedures INTEGER DEFAULT 0,
  procedures_by_module JSONB DEFAULT '{}',
  progress_summary JSONB DEFAULT '{}',
  recommendations TEXT,
  supervisor_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.supervisor_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supervisor_reports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for supervisor_teams
CREATE POLICY "Supervisors can view their own teams" 
ON public.supervisor_teams 
FOR SELECT 
USING (supervisor_id = auth.uid());

CREATE POLICY "Supervisors can manage their own teams" 
ON public.supervisor_teams 
FOR ALL 
USING (supervisor_id = auth.uid());

-- RLS Policies for team_members
CREATE POLICY "Supervisors can view their team members" 
ON public.team_members 
FOR SELECT 
USING (
  team_id IN (
    SELECT id FROM public.supervisor_teams WHERE supervisor_id = auth.uid()
  )
);

CREATE POLICY "Residents can view their own team membership" 
ON public.team_members 
FOR SELECT 
USING (resident_id = auth.uid());

CREATE POLICY "Supervisors can manage their team members" 
ON public.team_members 
FOR ALL 
USING (
  team_id IN (
    SELECT id FROM public.supervisor_teams WHERE supervisor_id = auth.uid()
  )
);

-- RLS Policies for supervisor_reports
CREATE POLICY "Supervisors can view their reports" 
ON public.supervisor_reports 
FOR SELECT 
USING (supervisor_id = auth.uid());

CREATE POLICY "Residents can view reports about them" 
ON public.supervisor_reports 
FOR SELECT 
USING (resident_id = auth.uid());

CREATE POLICY "Supervisors can manage their reports" 
ON public.supervisor_reports 
FOR ALL 
USING (supervisor_id = auth.uid());

-- Create function to get supervisor's residents
CREATE OR REPLACE FUNCTION public.get_supervisor_residents(supervisor_user_id UUID)
RETURNS TABLE(
  resident_id UUID,
  resident_name TEXT,
  resident_email TEXT,
  pgy_level INTEGER,
  department TEXT,
  hospital TEXT,
  team_name TEXT,
  joined_at TIMESTAMP WITH TIME ZONE,
  total_procedures BIGINT,
  last_activity DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.user_id as resident_id,
    p.full_name as resident_name,
    p.email as resident_email,
    p.pgy_level,
    p.department,
    p.hospital,
    st.team_name,
    tm.joined_at,
    COALESCE(proc_counts.total_procedures, 0) as total_procedures,
    COALESCE(proc_counts.last_activity, NULL) as last_activity
  FROM public.profiles p
  JOIN public.team_members tm ON p.user_id = tm.resident_id
  JOIN public.supervisor_teams st ON tm.team_id = st.id
  LEFT JOIN (
    SELECT 
      pl.user_id,
      COUNT(*) as total_procedures,
      MAX(pl.performed_date) as last_activity
    FROM public.procedure_logs pl
    GROUP BY pl.user_id
  ) proc_counts ON p.user_id = proc_counts.user_id
  WHERE st.supervisor_id = supervisor_user_id
    AND tm.status = 'active'
  ORDER BY p.full_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get resident progress summary
CREATE OR REPLACE FUNCTION public.get_resident_progress_summary(resident_user_id UUID)
RETURNS TABLE(
  module_name TEXT,
  module_key TEXT,
  total_weighted_score NUMERIC,
  total_minimum NUMERIC,
  progress_percentage NUMERIC,
  responsible_count INTEGER,
  instructing_count INTEGER,
  assistant_count INTEGER,
  last_procedure_date DATE
) AS $$
BEGIN
  RETURN QUERY
  WITH module_procedures AS (
    SELECT p.id, p.code, p.title_de, p.min_required_by_pgy, pc.key as module_key, pc.title_de as module_name
    FROM public.procedures p
    JOIN public.procedure_categories pc ON p.category_id = pc.id
    WHERE p.active = true AND pc.module_type IS NOT NULL
  ),
  user_logs AS (
    SELECT 
      pl.procedure_id,
      pl.role_in_surgery,
      pl.performed_date,
      COUNT(*) as count
    FROM public.procedure_logs pl
    WHERE pl.user_id = resident_user_id
    GROUP BY pl.procedure_id, pl.role_in_surgery, pl.performed_date
  ),
  procedure_scores AS (
    SELECT 
      mp.id,
      mp.module_key,
      mp.module_name,
      COALESCE(ul_responsible.count, 0) as responsible_count,
      COALESCE(ul_instructing.count, 0) as instructing_count,
      COALESCE(ul_assistant.count, 0) as assistant_count,
      (COALESCE(ul_responsible.count, 0) * 1.0 + 
       COALESCE(ul_instructing.count, 0) * 0.5 + 
       COALESCE(ul_assistant.count, 0) * 0.25) as weighted_score,
      COALESCE((mp.min_required_by_pgy->>'pgy5')::NUMERIC, 0) as min_required,
      MAX(ul_responsible.performed_date) as last_date
    FROM module_procedures mp
    LEFT JOIN user_logs ul_responsible ON mp.id = ul_responsible.procedure_id 
      AND ul_responsible.role_in_surgery IN ('primary', 'responsible')
    LEFT JOIN user_logs ul_instructing ON mp.id = ul_instructing.procedure_id 
      AND ul_instructing.role_in_surgery = 'instructing'
    LEFT JOIN user_logs ul_assistant ON mp.id = ul_assistant.procedure_id 
      AND ul_assistant.role_in_surgery IN ('assist', 'assistant')
    GROUP BY mp.id, mp.module_key, mp.module_name, mp.min_required_by_pgy
  )
  SELECT 
    ps.module_name,
    ps.module_key,
    COALESCE(SUM(ps.weighted_score), 0) as total_weighted_score,
    COALESCE(SUM(ps.min_required), 0) as total_minimum,
    CASE 
      WHEN COALESCE(SUM(ps.min_required), 0) > 0 
      THEN (COALESCE(SUM(ps.weighted_score), 0) / COALESCE(SUM(ps.min_required), 0)) * 100
      ELSE 0 
    END as progress_percentage,
    COALESCE(SUM(ps.responsible_count), 0)::INTEGER as responsible_count,
    COALESCE(SUM(ps.instructing_count), 0)::INTEGER as instructing_count,
    COALESCE(SUM(ps.assistant_count), 0)::INTEGER as assistant_count,
    MAX(ps.last_date) as last_procedure_date
  FROM procedure_scores ps
  GROUP BY ps.module_key, ps.module_name
  ORDER BY ps.module_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.get_supervisor_residents(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_resident_progress_summary(UUID) TO authenticated;

-- Create triggers for updated_at
CREATE TRIGGER update_supervisor_teams_updated_at
BEFORE UPDATE ON public.supervisor_teams
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_team_members_updated_at
BEFORE UPDATE ON public.team_members
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_supervisor_reports_updated_at
BEFORE UPDATE ON public.supervisor_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

