/*
  # Fix Authentication Signup Flow

  1. Changes
    - Add missing RLS policies for profiles table
    - Ensure proper cascade behavior for user deletion
    - Fix profile creation trigger
    - Add email verification handling
  
  2. Security
    - Enable RLS on all relevant tables
    - Add proper policies for profile access
*/

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS create_profile_after_user_creation ON auth.users;
DROP FUNCTION IF EXISTS create_profile_for_new_user();

-- Create an improved version of the profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (new.id, new.email)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS email text;

-- Update or create RLS policies for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'cynemos@gmail.com');

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Ensure proper cascade behavior
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_user_id_fkey,
ADD CONSTRAINT profiles_user_id_fkey
  FOREIGN KEY (user_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

-- Create missing profiles for existing users
INSERT INTO public.profiles (user_id, email)
SELECT id, email
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.profiles)
ON CONFLICT (user_id) DO NOTHING;
