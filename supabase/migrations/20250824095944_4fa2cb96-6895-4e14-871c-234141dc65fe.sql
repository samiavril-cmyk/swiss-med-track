-- Phase 1: Fix database constraints and create import tables
-- Update procedure_logs constraint to use correct role values
ALTER TABLE public.procedure_logs DROP CONSTRAINT IF EXISTS procedure_logs_role_in_surgery_check;
ALTER TABLE public.procedure_logs ADD CONSTRAINT procedure_logs_role_in_surgery_check 
  CHECK (role_in_surgery IN ('responsible', 'instructing', 'assistant'));

-- Create import runs table for tracking imports
CREATE TABLE public.import_runs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  finished_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running' CHECK (status IN ('running', 'completed', 'failed', 'cancelled')),
  summary_json JSONB,
  source TEXT NOT NULL DEFAULT 'siwf_pdf',
  pdf_filename TEXT,
  pdf_stand_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create staging table for preview before commit
CREATE TABLE public.import_procedure_staging (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES public.import_runs(id) ON DELETE CASCADE,
  module_name TEXT NOT NULL,
  proc_name TEXT NOT NULL,
  minimum INTEGER DEFAULT 0,
  responsible INTEGER DEFAULT 0,
  instructing INTEGER DEFAULT 0,
  assistant INTEGER DEFAULT 0,
  total INTEGER DEFAULT 0,
  matched_proc_id UUID REFERENCES public.procedures(id),
  match_confidence DECIMAL DEFAULT 0.0,
  match_method TEXT, -- 'exact', 'alias', 'fuzzy', 'manual'
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'matched', 'needs_review', 'error')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create procedure aliases table for improved matching
CREATE TABLE public.procedure_aliases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  procedure_id UUID NOT NULL REFERENCES public.procedures(id) ON DELETE CASCADE,
  alias_name TEXT NOT NULL,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(alias_name, procedure_id)
);

-- Enable RLS on new tables
ALTER TABLE public.import_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.import_procedure_staging ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedure_aliases ENABLE ROW LEVEL SECURITY;

-- RLS policies for import_runs
CREATE POLICY "Users can manage their own import runs" 
ON public.import_runs 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS policies for import_procedure_staging
CREATE POLICY "Users can manage their own staging data" 
ON public.import_procedure_staging 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.import_runs 
  WHERE import_runs.id = import_procedure_staging.run_id 
  AND import_runs.user_id = auth.uid()
));

-- RLS policies for procedure_aliases
CREATE POLICY "Anyone can view procedure aliases" 
ON public.procedure_aliases 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create aliases" 
ON public.procedure_aliases 
FOR INSERT 
WITH CHECK (auth.uid() = created_by);

-- Add updated_at trigger to import_runs
CREATE TRIGGER update_import_runs_updated_at
  BEFORE UPDATE ON public.import_runs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some common aliases for better matching
INSERT INTO public.procedure_aliases (procedure_id, alias_name, created_by) 
SELECT p.id, alias.name, null
FROM public.procedures p
CROSS JOIN (VALUES 
  ('Appendektomie', 'Appendektomie offen'),
  ('Appendektomie', 'Appendektomie laparoskopisch'),
  ('Cholezystektomie', 'Cholezystektomie laparoskopisch'),
  ('Cholezystektomie', 'Gallenblase'),
  ('Hernienreparatur', 'Hernienoperationen'),
  ('Hernienreparatur', 'Leistenhernien'),
  ('Wundversorgung', 'Wundversorgungen'),
  ('Thoraxdrainagen', 'Thoraxdrainage')
) AS alias(name, proc_name)
WHERE p.title_de = alias.proc_name
ON CONFLICT (alias_name, procedure_id) DO NOTHING;