-- Create storage bucket for thermal images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'thermal-images',
  'thermal-images',
  false,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
);

-- Allow authenticated users to upload their own thermal images
CREATE POLICY "Users can upload thermal images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'thermal-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to view their own thermal images
CREATE POLICY "Users can view their own thermal images"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'thermal-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own thermal images
CREATE POLICY "Users can delete their own thermal images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'thermal-images' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Create table to store detection results
CREATE TABLE IF NOT EXISTS public.detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  image_path TEXT NOT NULL,
  detections JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS on detections table
ALTER TABLE public.detections ENABLE ROW LEVEL SECURITY;

-- Users can view their own detections
CREATE POLICY "Users can view their own detections"
ON public.detections
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can create their own detections
CREATE POLICY "Users can create their own detections"
ON public.detections
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own detections
CREATE POLICY "Users can delete their own detections"
ON public.detections
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);