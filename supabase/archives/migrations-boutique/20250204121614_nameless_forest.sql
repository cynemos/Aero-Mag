/*
  # Fix Email Confirmation

  1. Changes
    - Add email_confirmed column to profiles table
    - Update trigger to set email_confirmed on user creation
    - Add policy for email confirmation updates
*/

-- Add email_confirmed column to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email_confirmed boolean DEFAULT false;

-- Update the handle_new_user function to set email_confirmed
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, email_confirmed)
  VALUES (new.id, new.email, true)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    email = EXCLUDED.email,
    email_confirmed = true;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure all existing profiles have email_confirmed set to true
UPDATE public.profiles
SET email_confirmed = true
WHERE email_confirmed IS NULL OR email_confirmed = false;

-- Add policy for email confirmation updates
CREATE POLICY "Users can update their own email confirmation"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
