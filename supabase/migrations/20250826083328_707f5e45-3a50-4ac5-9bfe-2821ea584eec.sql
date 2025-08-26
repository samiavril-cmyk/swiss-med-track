-- Create storage bucket for course images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'course-images', 
  'course-images', 
  true, 
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Create policies for course image uploads
CREATE POLICY "Course images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'course-images');

CREATE POLICY "Authenticated users can upload course images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'course-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can update course images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'course-images' 
  AND auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete course images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'course-images' 
  AND auth.role() = 'authenticated'
);

-- Add start_date, end_date, and registration_deadline to courses table
ALTER TABLE courses 
ADD COLUMN start_date timestamp with time zone,
ADD COLUMN end_date timestamp with time zone,
ADD COLUMN registration_deadline timestamp with time zone;