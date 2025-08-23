-- Course marketplace database extensions

-- Course reviews table
CREATE TABLE public.course_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(course_id, user_id)
);

-- Course videos relationship table
CREATE TABLE public.course_videos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  video_id UUID REFERENCES public.videos(id) ON DELETE CASCADE,
  video_type TEXT NOT NULL DEFAULT 'lesson', -- 'trailer', 'lesson', 'material'
  is_preview BOOLEAN NOT NULL DEFAULT false, -- true for free preview videos
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Course sessions for multiple dates per course
CREATE TABLE public.course_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_participants INTEGER,
  current_participants INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'running', 'completed', 'cancelled'
  location TEXT,
  instructor_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Course materials and downloads
CREATE TABLE public.course_materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT,
  file_type TEXT, -- 'pdf', 'video', 'audio', 'document'
  file_size BIGINT, -- in bytes
  is_preview BOOLEAN NOT NULL DEFAULT false, -- true for free preview materials
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  session_id UUID REFERENCES public.course_sessions(id) ON DELETE SET NULL,
  stripe_payment_intent_id TEXT,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CHF',
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
  payment_method TEXT, -- 'stripe', 'invoice', 'bank_transfer'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invoices table
CREATE TABLE public.invoices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_id UUID REFERENCES public.payments(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'CHF',
  vat_rate DECIMAL(5,2) DEFAULT 7.7, -- Swiss VAT rate
  vat_amount DECIMAL(10,2),
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'sent', 'paid', 'cancelled'
  due_date DATE,
  paid_date DATE,
  pdf_url TEXT,
  billing_address JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add new columns to existing courses table
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS difficulty_level TEXT DEFAULT 'beginner'; -- 'beginner', 'intermediate', 'advanced'
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS tags TEXT[];
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS has_certificate BOOLEAN DEFAULT false;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS certificate_template_url TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS average_rating DECIMAL(3,2) DEFAULT 0.0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Enable RLS on all new tables
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- RLS Policies for course_reviews
CREATE POLICY "Anyone can view published course reviews" ON public.course_reviews
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_reviews.course_id 
    AND courses.status = 'published'
  )
);

CREATE POLICY "Users can create reviews for courses they enrolled in" ON public.course_reviews
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.course_enrollments 
    WHERE course_enrollments.user_id = auth.uid() 
    AND course_enrollments.course_id = course_reviews.course_id
    AND course_enrollments.status = 'completed'
  )
);

CREATE POLICY "Users can update their own reviews" ON public.course_reviews
FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" ON public.course_reviews
FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for course_videos
CREATE POLICY "Anyone can view course videos" ON public.course_videos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_videos.course_id 
    AND (courses.status = 'published' OR courses.provider_id = auth.uid())
  )
);

CREATE POLICY "Course providers can manage their course videos" ON public.course_videos
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_videos.course_id 
    AND courses.provider_id = auth.uid()
  )
);

-- RLS Policies for course_sessions
CREATE POLICY "Anyone can view published course sessions" ON public.course_sessions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_sessions.course_id 
    AND courses.status = 'published'
  )
);

CREATE POLICY "Course providers can manage their course sessions" ON public.course_sessions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_sessions.course_id 
    AND courses.provider_id = auth.uid()
  )
);

-- RLS Policies for course_materials
CREATE POLICY "Users can view course materials" ON public.course_materials
FOR SELECT USING (
  is_preview = true OR 
  EXISTS (
    SELECT 1 FROM public.course_enrollments ce
    JOIN public.courses c ON c.id = ce.course_id
    WHERE c.id = course_materials.course_id 
    AND ce.user_id = auth.uid()
    AND ce.status IN ('enrolled', 'completed')
  ) OR
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_materials.course_id 
    AND courses.provider_id = auth.uid()
  )
);

CREATE POLICY "Course providers can manage their course materials" ON public.course_materials
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = course_materials.course_id 
    AND courses.provider_id = auth.uid()
  )
);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON public.payments
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" ON public.payments
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Providers can view payments for their courses" ON public.payments
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.courses 
    WHERE courses.id = payments.course_id 
    AND courses.provider_id = auth.uid()
  )
);

-- RLS Policies for invoices
CREATE POLICY "Users can view their own invoices" ON public.invoices
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own invoices" ON public.invoices
FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Function to update course rating when reviews are added/updated/deleted
CREATE OR REPLACE FUNCTION public.update_course_rating()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    UPDATE public.courses SET 
      average_rating = COALESCE((
        SELECT AVG(rating::DECIMAL) 
        FROM public.course_reviews 
        WHERE course_id = OLD.course_id
      ), 0),
      total_reviews = COALESCE((
        SELECT COUNT(*) 
        FROM public.course_reviews 
        WHERE course_id = OLD.course_id
      ), 0)
    WHERE id = OLD.course_id;
    RETURN OLD;
  ELSE
    UPDATE public.courses SET 
      average_rating = COALESCE((
        SELECT AVG(rating::DECIMAL) 
        FROM public.course_reviews 
        WHERE course_id = NEW.course_id
      ), 0),
      total_reviews = COALESCE((
        SELECT COUNT(*) 
        FROM public.course_reviews 
        WHERE course_id = NEW.course_id
      ), 0)
    WHERE id = NEW.course_id;
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update course rating
CREATE TRIGGER update_course_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.course_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_course_rating();

-- Trigger for updated_at timestamps
CREATE TRIGGER update_course_reviews_updated_at
  BEFORE UPDATE ON public.course_reviews
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_sessions_updated_at
  BEFORE UPDATE ON public.course_sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_course_materials_updated_at
  BEFORE UPDATE ON public.course_materials
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Generate unique invoice numbers
CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT AS $$
BEGIN
  RETURN 'INV-' || TO_CHAR(NOW(), 'YYYY-MM') || '-' || LPAD(NEXTVAL('invoice_number_seq')::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

-- Create sequence for invoice numbers
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1000;