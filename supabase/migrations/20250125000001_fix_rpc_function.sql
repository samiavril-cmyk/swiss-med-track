-- Fix RPC function conflicts and data type inconsistencies
-- This migration resolves all identified issues with get_module_progress function

-- First, update the procedure_logs constraint to allow 'primary' role
ALTER TABLE public.procedure_logs DROP CONSTRAINT IF EXISTS procedure_logs_role_in_surgery_check;
ALTER TABLE public.procedure_logs ADD CONSTRAINT procedure_logs_role_in_surgery_check 
  CHECK (role_in_surgery IN ('primary', 'responsible', 'instructing', 'assistant', 'observer'));

-- Create the definitive, corrected version of get_module_progress function
CREATE OR REPLACE FUNCTION public.get_module_progress(user_id_param UUID, module_key TEXT)
RETURNS TABLE(
  module_name TEXT,
  total_weighted_score NUMERIC,
  total_minimum NUMERIC,
  progress_percentage NUMERIC,
  responsible_count INTEGER,
  instructing_count INTEGER,
  assistant_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH module_procedures AS (
    SELECT p.id, p.code, p.title_de, p.min_required_by_pgy
    FROM public.procedures p
    JOIN public.procedure_categories pc ON p.category_id = pc.id
    WHERE pc.key = module_key AND p.active = true
  ),
  user_logs AS (
    SELECT 
      pl.procedure_id,
      pl.role_in_surgery,
      COUNT(*) as count
    FROM public.procedure_logs pl
    WHERE pl.user_id = user_id_param
    GROUP BY pl.procedure_id, pl.role_in_surgery
  ),
  procedure_scores AS (
    SELECT 
      mp.id,
      mp.code,
      mp.title_de,
      mp.min_required_by_pgy,
      -- Handle both 'primary' and 'responsible' roles for backward compatibility
      COALESCE(ul_responsible.count, 0) as responsible_count,
      COALESCE(ul_instructing.count, 0) as instructing_count,
      COALESCE(ul_assistant.count, 0) as assistant_count,
      -- Calculate weighted score: responsible/primary=1.0, instructing=0.5, assistant=0.25
      (COALESCE(ul_responsible.count, 0) * 1.0 + 
       COALESCE(ul_instructing.count, 0) * 0.5 + 
       COALESCE(ul_assistant.count, 0) * 0.25) as weighted_score,
      -- Get minimum required for PGY5 (highest level)
      COALESCE((mp.min_required_by_pgy->>'pgy5')::NUMERIC, 0) as min_required
    FROM module_procedures mp
    LEFT JOIN user_logs ul_responsible ON mp.id = ul_responsible.procedure_id 
      AND ul_responsible.role_in_surgery IN ('primary', 'responsible')
    LEFT JOIN user_logs ul_instructing ON mp.id = ul_instructing.procedure_id 
      AND ul_instructing.role_in_surgery = 'instructing'
    LEFT JOIN user_logs ul_assistant ON mp.id = ul_assistant.procedure_id 
      AND ul_assistant.role_in_surgery IN ('assist', 'assistant')
  )
  SELECT 
    pc.title_de as module_name,
    COALESCE(SUM(ps.weighted_score), 0) as total_weighted_score,
    COALESCE(SUM(ps.min_required), 0) as total_minimum,
    CASE 
      WHEN COALESCE(SUM(ps.min_required), 0) > 0 
      THEN (COALESCE(SUM(ps.weighted_score), 0) / COALESCE(SUM(ps.min_required), 0)) * 100
      ELSE 0 
    END as progress_percentage,
    COALESCE(SUM(ps.responsible_count), 0)::INTEGER as responsible_count,
    COALESCE(SUM(ps.instructing_count), 0)::INTEGER as instructing_count,
    COALESCE(SUM(ps.assistant_count), 0)::INTEGER as assistant_count
  FROM public.procedure_categories pc
  LEFT JOIN procedure_scores ps ON pc.id = ps.id
  WHERE pc.key = module_key
  GROUP BY pc.id, pc.title_de;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION public.get_module_progress(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_module_progress(UUID, TEXT) TO anon;
