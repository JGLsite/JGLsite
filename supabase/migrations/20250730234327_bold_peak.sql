/*
  # Fix Infinite Recursion in RLS Policies

  1. Problem
    - RLS policies on user_profiles table are causing infinite recursion
    - This happens when policies reference the same table they're protecting
    - The admin policy was checking user_profiles.role while being applied to user_profiles

  2. Solution
    - Drop all existing policies on user_profiles
    - Create simplified policies that don't cause recursion
    - Use auth.uid() directly instead of subqueries to user_profiles
    - Separate admin access from regular user access

  3. New Policies
    - Users can manage their own profile using auth.uid()
    - Admins identified by a separate mechanism or simplified check
*/

-- Drop all existing policies on user_profiles to start fresh
DROP POLICY IF EXISTS "Users can read own data" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can create profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Admins can update any user profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can create any user profile" ON user_profiles;
DROP POLICY IF EXISTS "Admins can delete user profiles" ON user_profiles;

-- Create simple, non-recursive policies
CREATE POLICY "Enable read access for own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Enable update access for own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert access for authenticated users"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- For admin access, we'll use a simpler approach
-- This policy allows users with admin role to access all profiles
-- but avoids recursion by using a direct role check
CREATE POLICY "Enable admin access"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );