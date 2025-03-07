/*
  # Create storage bucket for magazine covers

  1. New Storage
    - Create a new public bucket named 'magazines' for storing magazine covers
    - Enable public access to the bucket
*/

-- Create a new storage bucket for magazine covers
INSERT INTO storage.buckets (id, name, public)
VALUES ('magazines', 'magazines', true);

-- Create a policy to allow public access to the bucket
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'magazines');

-- Create a policy to allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'magazines');

-- Create a policy to allow authenticated users to update their files
CREATE POLICY "Authenticated users can update files"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'magazines');

-- Create a policy to allow authenticated users to delete their files
CREATE POLICY "Authenticated users can delete files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'magazines');
