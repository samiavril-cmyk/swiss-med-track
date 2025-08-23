-- Fix the procedure tracking system with correct enum handling

-- Add FMH module support to procedure_categories
ALTER TABLE public.procedure_categories ADD COLUMN IF NOT EXISTS module_type text;
ALTER TABLE public.procedure_categories ADD COLUMN IF NOT EXISTS minimum_required integer DEFAULT 0;
ALTER TABLE public.procedure_categories ADD COLUMN IF NOT EXISTS weighted_scoring boolean DEFAULT true;

-- Create procedure role weights table for configurable scoring
CREATE TABLE IF NOT EXISTS public.procedure_role_weights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role_type text NOT NULL CHECK (role_type IN ('responsible', 'instructing', 'assistant')),
  weight_factor decimal NOT NULL DEFAULT 1.0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default role weights
INSERT INTO public.procedure_role_weights (role_type, weight_factor) VALUES
  ('responsible', 1.0),
  ('instructing', 0.75),
  ('assistant', 0.5)
ON CONFLICT DO NOTHING;

-- Enable RLS on procedure_role_weights
ALTER TABLE public.procedure_role_weights ENABLE ROW LEVEL SECURITY;

-- Create policies for procedure_role_weights
CREATE POLICY "Anyone can view role weights" 
ON public.procedure_role_weights 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage role weights" 
ON public.procedure_role_weights 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- Add weighted score calculation to procedure_logs
ALTER TABLE public.procedure_logs ADD COLUMN IF NOT EXISTS weighted_score decimal;

-- Create function to calculate weighted score
CREATE OR REPLACE FUNCTION public.calculate_weighted_score(role_text text)
RETURNS decimal AS $$
BEGIN
  RETURN (
    SELECT weight_factor 
    FROM public.procedure_role_weights 
    WHERE role_type = role_text
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Create trigger to automatically calculate weighted score
CREATE OR REPLACE FUNCTION public.update_procedure_weighted_score()
RETURNS trigger AS $$
BEGIN
  NEW.weighted_score = calculate_weighted_score(NEW.role_in_surgery);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS update_procedure_weighted_score_trigger ON public.procedure_logs;
CREATE TRIGGER update_procedure_weighted_score_trigger
  BEFORE INSERT OR UPDATE ON public.procedure_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_procedure_weighted_score();

-- Insert FMH procedure categories/modules
INSERT INTO public.procedure_categories (key, title_de, title_en, module_type, minimum_required, sort_index) VALUES
  ('basis_notfall', 'Basis Notfallchirurgie', 'Basic Emergency Surgery', 'basis_notfall', 85, 1),
  ('basis_allgemein', 'Basis Allgemeinchirurgie', 'Basic General Surgery', 'basis_allgemein', 0, 2),
  ('viszeralchirurgie', 'Viszeralchirurgie', 'Visceral Surgery', 'viszeralchirurgie', 0, 3),
  ('traumatologie', 'Traumatologie des Bewegungsapparates', 'Trauma Surgery', 'traumatologie', 0, 4),
  ('kombination', 'Kombination', 'Combined Module', 'kombination', 0, 5)
ON CONFLICT (key) DO UPDATE SET
  title_de = EXCLUDED.title_de,
  title_en = EXCLUDED.title_en,
  module_type = EXCLUDED.module_type,
  minimum_required = EXCLUDED.minimum_required,
  sort_index = EXCLUDED.sort_index;

-- Insert sample FMH procedures with realistic minimums
INSERT INTO public.procedures (code, title_de, title_en, category_id, min_required_by_pgy, active) VALUES
  -- Basis Notfallchirurgie
  ('BN001', 'Wundversorgung', 'Wound Care', (SELECT id FROM procedure_categories WHERE key = 'basis_notfall'), '{"1": 5, "2": 10, "3": 15}', true),
  ('BN002', 'Thoraxdrainage', 'Chest Tube Insertion', (SELECT id FROM procedure_categories WHERE key = 'basis_notfall'), '{"2": 3, "3": 5, "4": 8}', true),
  ('BN003', 'Chirurgisches Schockraummanagement', 'Surgical Trauma Management', (SELECT id FROM procedure_categories WHERE key = 'basis_notfall'), '{"3": 5, "4": 10}', true),
  
  -- Basis Allgemeinchirurgie
  ('BA001', 'Appendektomie', 'Appendectomy', (SELECT id FROM procedure_categories WHERE key = 'basis_allgemein'), '{"2": 5, "3": 10, "4": 15}', true),
  ('BA002', 'Cholezystektomie', 'Cholecystectomy', (SELECT id FROM procedure_categories WHERE key = 'basis_allgemein'), '{"3": 3, "4": 8, "5": 12}', true),
  ('BA003', 'Hernienoperationen (inguinal/umbilical)', 'Hernia Repair (inguinal/umbilical)', (SELECT id FROM procedure_categories WHERE key = 'basis_allgemein'), '{"2": 3, "3": 8, "4": 15}', true),
  ('BA004', 'Proktologische Eingriffe', 'Proctological Procedures', (SELECT id FROM procedure_categories WHERE key = 'basis_allgemein'), '{"3": 5, "4": 10}', true),
  
  -- Viszeralchirurgie
  ('VS001', 'Abdominalhernien (Narbenhernien, videoskopischer Repair)', 'Abdominal Hernias (Incisional, Laparoscopic)', (SELECT id FROM procedure_categories WHERE key = 'viszeralchirurgie'), '{"4": 3, "5": 8}', true),
  ('VS002', 'Endokrine Chirurgie', 'Endocrine Surgery', (SELECT id FROM procedure_categories WHERE key = 'viszeralchirurgie'), '{"4": 2, "5": 5}', true),
  ('VS003', 'Splenektomie', 'Splenectomy', (SELECT id FROM procedure_categories WHERE key = 'viszeralchirurgie'), '{"4": 1, "5": 3}', true),
  ('VS004', 'Dickdarmstoma', 'Colostomy', (SELECT id FROM procedure_categories WHERE key = 'viszeralchirurgie'), '{"3": 2, "4": 5}', true),
  ('VS005', 'Laparoskopie/Laparotomie', 'Laparoscopy/Laparotomy', (SELECT id FROM procedure_categories WHERE key = 'viszeralchirurgie'), '{"3": 10, "4": 20, "5": 30}', true),
  
  -- Traumatologie
  ('TR001', 'Reposition Luxation/Frakturen', 'Reduction of Dislocations/Fractures', (SELECT id FROM procedure_categories WHERE key = 'traumatologie'), '{"1": 5, "2": 10, "3": 15}', true),
  ('TR002', 'Osteosynthese (Platten, Schrauben, Nägel)', 'Osteosynthesis (Plates, Screws, Nails)', (SELECT id FROM procedure_categories WHERE key = 'traumatologie'), '{"2": 5, "3": 12, "4": 20}', true),
  ('TR003', 'Amputationen (klein/groß)', 'Amputations (minor/major)', (SELECT id FROM procedure_categories WHERE key = 'traumatologie'), '{"3": 2, "4": 5}', true),
  ('TR004', 'Handchirurgie', 'Hand Surgery', (SELECT id FROM procedure_categories WHERE key = 'traumatologie'), '{"3": 3, "4": 8}', true)
ON CONFLICT (code) DO UPDATE SET
  title_de = EXCLUDED.title_de,
  title_en = EXCLUDED.title_en,
  category_id = EXCLUDED.category_id,
  min_required_by_pgy = EXCLUDED.min_required_by_pgy,
  active = EXCLUDED.active;

-- Create function to get module progress
CREATE OR REPLACE FUNCTION public.get_module_progress(user_id_param uuid, module_key text)
RETURNS TABLE(
  module_name text,
  total_weighted_score decimal,
  total_minimum integer,
  progress_percentage decimal,
  responsible_count integer,
  instructing_count integer,
  assistant_count integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.title_de as module_name,
    COALESCE(SUM(pl.weighted_score), 0) as total_weighted_score,
    COALESCE(pc.minimum_required, 0) as total_minimum,
    CASE 
      WHEN pc.minimum_required > 0 THEN 
        LEAST(100, (COALESCE(SUM(pl.weighted_score), 0) / pc.minimum_required * 100))
      ELSE 0 
    END as progress_percentage,
    COALESCE(SUM(CASE WHEN pl.role_in_surgery = 'responsible' THEN 1 ELSE 0 END), 0)::integer as responsible_count,
    COALESCE(SUM(CASE WHEN pl.role_in_surgery = 'instructing' THEN 1 ELSE 0 END), 0)::integer as instructing_count,
    COALESCE(SUM(CASE WHEN pl.role_in_surgery = 'assistant' THEN 1 ELSE 0 END), 0)::integer as assistant_count
  FROM public.procedure_categories pc
  LEFT JOIN public.procedures p ON p.category_id = pc.id
  LEFT JOIN public.procedure_logs pl ON pl.procedure_id = p.id AND pl.user_id = user_id_param
  WHERE pc.key = module_key
  GROUP BY pc.id, pc.title_de, pc.minimum_required;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;