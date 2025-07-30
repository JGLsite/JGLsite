/*
  # Fix User Profiles RLS Policies

  1. Security Updates
    - Drop existing conflicting RLS policies on user_profiles table
    - Add comprehensive RLS policies for proper access control
    - Allow users to view and update their own profiles
    - Allow admins to manage all user profiles
    - Allow authenticated users to create profiles during signup

  2. Policy Details
    - Users can view their own profile data
    - Users can update their own profile data
    - Authenticated users can create profiles (for signup process)
    - Admins can manage all profiles (view, update, delete)
*/

-- Drop existing policies that might be conflicting
DROP POLICY IF EXISTS "Allow profile creation" ON public.user_profiles;
DROP POLICY IF EXISTS "Public profile read access" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can manage own profile" ON public.user_profiles;

-- Ensure RLS is enabled
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy for users to view their own profile
CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy for users to update their own profile
CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Policy for authenticated users to create profiles (needed for signup)
CREATE POLICY "Authenticated users can create profiles"
ON public.user_profiles FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Policy for admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.user_profiles FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy for admins to create any user profile
CREATE POLICY "Admins can create any user profile"
ON public.user_profiles FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy for admins to update any user profile
CREATE POLICY "Admins can update any user profile"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Policy for admins to delete user profiles
CREATE POLICY "Admins can delete user profiles"
ON public.user_profiles FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    )
);