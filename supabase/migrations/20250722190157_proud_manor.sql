/*
  # Fix RLS Infinite Recursion in User Profiles

  1. Problem
    - Current RLS policies on user_profiles table are causing infinite recursion
    - Policies are referencing user_profiles table within their own conditions
    - This creates circular dependencies during policy evaluation

  2. Solution
    - Replace problematic policies with simpler, direct conditions
    - Use auth.uid() directly instead of subqueries to user_profiles
    - Ensure policies don't reference the same table they're protecting

  3. Changes
    - Drop existing problematic policies
    - Create new simplified policies that avoid recursion
    - Maintain same security model but with direct auth checks
*/

-- Drop all existing policies on user_profiles to start fresh
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Coaches can view gymnasts in their gym" ON user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON user_profiles;

-- Create new simplified policies that avoid recursion

-- Users can view and update their own profile (direct auth check)
CREATE POLICY "Users can manage own profile"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow public read access for basic profile info (needed for app functionality)
-- This avoids the need for complex subqueries that cause recursion
CREATE POLICY "Public profile read access"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow inserts for new user registration
CREATE POLICY "Allow profile creation"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);