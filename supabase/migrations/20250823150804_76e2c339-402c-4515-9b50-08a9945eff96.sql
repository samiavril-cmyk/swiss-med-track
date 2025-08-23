-- Create procedure categories
CREATE TABLE public.procedure_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  title_de TEXT NOT NULL,
  title_en TEXT,
  sort_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create procedures catalog (FMH)
CREATE TABLE public.procedures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title_de TEXT NOT NULL,
  title_en TEXT,
  category_id UUID REFERENCES public.procedure_categories(id),
  min_required_by_pgy JSONB DEFAULT '{}',
  pgy_recommended INTEGER[],
  fmh_ref TEXT,
  tags TEXT[],
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create procedure logs (user's logged procedures)
CREATE TABLE public.procedure_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  procedure_id UUID REFERENCES public.procedures(id),
  performed_date DATE NOT NULL,
  role_in_surgery TEXT CHECK (role_in_surgery IN ('observer', 'assist', 'primary')),
  supervisor TEXT,
  hospital TEXT,
  case_id TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create courses
CREATE TABLE public.courses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  modality TEXT CHECK (modality IN ('onsite', 'online', 'hybrid')),
  country TEXT,
  city TEXT,
  venue TEXT,
  language TEXT,
  specialty TEXT,
  cme_points INTEGER DEFAULT 0,
  price DECIMAL(10,2),
  currency TEXT DEFAULT 'CHF',
  capacity INTEGER,
  requirements TEXT,
  is_mandatory BOOLEAN DEFAULT false,
  points INTEGER DEFAULT 1,
  status TEXT CHECK (status IN ('draft', 'published', 'cancelled')) DEFAULT 'draft',
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create course enrollments
CREATE TABLE public.course_enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  course_id UUID REFERENCES public.courses(id),
  status TEXT CHECK (status IN ('enrolled', 'completed', 'cancelled')) DEFAULT 'enrolled',
  completion_date DATE,
  certificate_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create publications
CREATE TABLE public.publications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  journal TEXT,
  publication_date DATE,
  doi TEXT,
  link TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create awards
CREATE TABLE public.awards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  awarded_date DATE,
  organization TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Extend profiles table with additional fields
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS institution TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS specialty TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pgy_level INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS handle TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS public_fields JSONB DEFAULT '{"courses": true, "awards": true, "publications": true, "procedures": false}';

-- Enable RLS
ALTER TABLE public.procedure_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedure_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.awards ENABLE ROW LEVEL SECURITY;

-- RLS Policies for procedure_categories (public read)
CREATE POLICY "Anyone can view procedure categories" 
ON public.procedure_categories 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage procedure categories" 
ON public.procedure_categories 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- RLS Policies for procedures (public read)
CREATE POLICY "Anyone can view active procedures" 
ON public.procedures 
FOR SELECT 
USING (active = true);

CREATE POLICY "Only admins can manage procedures" 
ON public.procedures 
FOR ALL 
USING (get_current_user_role() = 'admin');

-- RLS Policies for procedure_logs
CREATE POLICY "Users can view their own procedure logs" 
ON public.procedure_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own procedure logs" 
ON public.procedure_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own procedure logs" 
ON public.procedure_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own procedure logs" 
ON public.procedure_logs 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for courses
CREATE POLICY "Anyone can view published courses" 
ON public.courses 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Providers can manage their own courses" 
ON public.courses 
FOR ALL 
USING (auth.uid() = provider_id OR get_current_user_role() = 'admin');

-- RLS Policies for course_enrollments
CREATE POLICY "Users can view their own enrollments" 
ON public.course_enrollments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own enrollments" 
ON public.course_enrollments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own enrollments" 
ON public.course_enrollments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for publications
CREATE POLICY "Users can view publications of public profiles" 
ON public.publications 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = publications.user_id 
    AND profiles.is_public = true 
    AND (profiles.public_fields->>'publications')::boolean = true
  )
);

CREATE POLICY "Users can manage their own publications" 
ON public.publications 
FOR ALL 
USING (auth.uid() = user_id);

-- RLS Policies for awards
CREATE POLICY "Users can view awards of public profiles" 
ON public.awards 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.user_id = awards.user_id 
    AND profiles.is_public = true 
    AND (profiles.public_fields->>'awards')::boolean = true
  )
);

CREATE POLICY "Users can manage their own awards" 
ON public.awards 
FOR ALL 
USING (auth.uid() = user_id);

-- Update profiles RLS to allow public viewing
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public profiles" 
ON public.profiles 
FOR SELECT 
USING (is_public = true);

-- Create triggers for updated_at
CREATE TRIGGER update_procedure_categories_updated_at
BEFORE UPDATE ON public.procedure_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_procedures_updated_at
BEFORE UPDATE ON public.procedures
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_procedure_logs_updated_at
BEFORE UPDATE ON public.procedure_logs
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
BEFORE UPDATE ON public.courses
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_enrollments_updated_at
BEFORE UPDATE ON public.course_enrollments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_publications_updated_at
BEFORE UPDATE ON public.publications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_awards_updated_at
BEFORE UPDATE ON public.awards
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert sample data
INSERT INTO public.procedure_categories (key, title_de, title_en, sort_index) VALUES
('general', 'Allgemeinchirurgie', 'General Surgery', 1),
('laparoscopy', 'Laparoskopie', 'Laparoscopy', 2),
('trauma', 'Traumachirurgie', 'Trauma Surgery', 3),
('vascular', 'Gefäßchirurgie', 'Vascular Surgery', 4);

INSERT INTO public.procedures (code, title_de, title_en, category_id, min_required_by_pgy, pgy_recommended) VALUES
('APP-001', 'Appendektomie offen', 'Open Appendectomy', (SELECT id FROM procedure_categories WHERE key = 'general'), '{"2": 5, "3": 10}', ARRAY[2,3]),
('LAP-001', 'Laparoskopische Appendektomie', 'Laparoscopic Appendectomy', (SELECT id FROM procedure_categories WHERE key = 'laparoscopy'), '{"3": 3, "4": 8}', ARRAY[3,4]),
('CHOL-001', 'Cholezystektomie laparoskopisch', 'Laparoscopic Cholecystectomy', (SELECT id FROM procedure_categories WHERE key = 'laparoscopy'), '{"3": 10, "4": 20}', ARRAY[3,4]),
('HER-001', 'Hernienreparatur', 'Hernia Repair', (SELECT id FROM procedure_categories WHERE key = 'general'), '{"2": 8, "3": 15}', ARRAY[2,3]);

INSERT INTO public.courses (provider_id, title, description, modality, country, specialty, cme_points, price, currency, is_mandatory, points, status) VALUES
((SELECT user_id FROM profiles LIMIT 1), 'Grundlagen der Laparoskopie', 'Einführungskurs in die laparoskopische Chirurgie', 'onsite', 'CH', 'Chirurgie', 8, 450.00, 'CHF', true, 2, 'published'),
((SELECT user_id FROM profiles LIMIT 1), 'Advanced Trauma Management', 'Fortgeschrittene Traumaversorgung', 'hybrid', 'CH', 'Chirurgie', 12, 680.00, 'CHF', false, 3, 'published'),
((SELECT user_id FROM profiles LIMIT 1), 'Wissenschaftliches Arbeiten', 'Methoden der medizinischen Forschung', 'online', 'DE', 'Allgemein', 6, 120.00, 'EUR', true, 1, 'published');