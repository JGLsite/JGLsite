/*
  # Jewish Gymnastics League Database Schema

  1. New Tables
    - `gyms` - Gymnastics facilities in the league
    - `users` - All system users (admins, coaches, gymnasts, hosts)
    - `gymnasts` - Gymnast-specific information and team membership
    - `events` - Competitions and league events
    - `registrations` - Event registrations with approval workflow
    - `challenges` - Gamification challenges for engagement
    - `challenge_completions` - Tracking challenge progress
    - `payments` - Payment tracking for events and memberships
    - `notifications` - System notifications and communications

  2. Security
    - Enable RLS on all tables
    - Role-based access policies
    - Secure user authentication flow

  3. Features
    - Multi-gym league management
    - Event registration with coach approval
    - Payment tracking and status
    - Challenge system with points
    - Notification system
    - Comprehensive user roles
*/

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'gym_admin', 'coach', 'gymnast', 'host');
CREATE TYPE membership_status AS ENUM ('pending', 'active', 'inactive', 'suspended');
CREATE TYPE event_status AS ENUM ('draft', 'open', 'closed', 'completed', 'cancelled');
CREATE TYPE registration_status AS ENUM ('pending', 'approved', 'rejected', 'waitlisted');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded', 'cancelled');
CREATE TYPE challenge_difficulty AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE completion_status AS ENUM ('pending', 'approved', 'rejected');

-- Gyms table
CREATE TABLE IF NOT EXISTS gyms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  address text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zip_code text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  website text,
  is_approved boolean DEFAULT false,
  admin_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'gymnast',
  gym_id uuid REFERENCES gyms(id),
  phone text,
  date_of_birth date,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Gymnasts table (additional info for gymnast users)
CREATE TABLE IF NOT EXISTS gymnasts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  gym_id uuid NOT NULL REFERENCES gyms(id),
  level text NOT NULL,
  is_team_member boolean DEFAULT false,
  approved_by_coach boolean DEFAULT false,
  approved_by_coach_at timestamptz,
  approved_by_coach_id uuid REFERENCES user_profiles(id),
  membership_status membership_status DEFAULT 'pending',
  total_points integer DEFAULT 0,
  parent_email text,
  parent_phone text,
  emergency_contact text,
  medical_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  event_date date NOT NULL,
  event_time time,
  location text NOT NULL,
  host_gym_id uuid NOT NULL REFERENCES gyms(id),
  registration_deadline date NOT NULL,
  max_participants integer,
  entry_fee decimal(10,2) DEFAULT 0,
  ticket_price decimal(10,2) DEFAULT 0,
  status event_status DEFAULT 'draft',
  levels_allowed text[] DEFAULT '{}',
  age_groups text[] DEFAULT '{}',
  created_by uuid NOT NULL REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Registrations table
CREATE TABLE IF NOT EXISTS registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  gymnast_id uuid NOT NULL REFERENCES gymnasts(id) ON DELETE CASCADE,
  status registration_status DEFAULT 'pending',
  registered_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES user_profiles(id),
  rejection_reason text,
  payment_status payment_status DEFAULT 'pending',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(event_id, gymnast_id)
);

-- Challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  points integer NOT NULL DEFAULT 0,
  difficulty challenge_difficulty DEFAULT 'beginner',
  category text,
  time_limit_days integer,
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Challenge completions table
CREATE TABLE IF NOT EXISTS challenge_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  gymnast_id uuid NOT NULL REFERENCES gymnasts(id) ON DELETE CASCADE,
  status completion_status DEFAULT 'pending',
  completed_at timestamptz DEFAULT now(),
  approved_at timestamptz,
  approved_by uuid REFERENCES user_profiles(id),
  evidence_notes text,
  points_awarded integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(challenge_id, gymnast_id)
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id),
  registration_id uuid REFERENCES registrations(id),
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'USD',
  payment_type text NOT NULL, -- 'registration', 'ticket', 'membership'
  status payment_status DEFAULT 'pending',
  stripe_payment_intent_id text,
  stripe_charge_id text,
  paid_at timestamptz,
  refunded_at timestamptz,
  refund_amount decimal(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  is_read boolean DEFAULT false,
  action_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE gymnasts ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for gyms
CREATE POLICY "Gyms are viewable by everyone" ON gyms FOR SELECT USING (true);
CREATE POLICY "Gym admins can update their gym" ON gyms FOR UPDATE USING (admin_id = auth.uid());
CREATE POLICY "Admins can manage all gyms" ON gyms FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for user_profiles
CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (id = auth.uid());
CREATE POLICY "Admins can view all profiles" ON user_profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Coaches can view gymnasts in their gym" ON user_profiles FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles coach 
    WHERE coach.id = auth.uid() 
    AND coach.role IN ('coach', 'gym_admin') 
    AND coach.gym_id = user_profiles.gym_id
  )
);

-- RLS Policies for gymnasts
CREATE POLICY "Gymnasts can view their own data" ON gymnasts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Coaches can view gymnasts in their gym" ON gymnasts FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('coach', 'gym_admin') 
    AND gym_id = gymnasts.gym_id
  )
);
CREATE POLICY "Coaches can update gymnasts in their gym" ON gymnasts FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('coach', 'gym_admin') 
    AND gym_id = gymnasts.gym_id
  )
);
CREATE POLICY "Admins can manage all gymnasts" ON gymnasts FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for events
CREATE POLICY "Events are viewable by everyone" ON events FOR SELECT USING (true);
CREATE POLICY "Admins and hosts can create events" ON events FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'host', 'gym_admin')
  )
);
CREATE POLICY "Event creators can update their events" ON events FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Admins can manage all events" ON events FOR ALL USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for registrations
CREATE POLICY "Users can view their own registrations" ON registrations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM gymnasts 
    WHERE id = registrations.gymnast_id 
    AND user_id = auth.uid()
  )
);
CREATE POLICY "Coaches can view registrations for their gymnasts" ON registrations FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM gymnasts g
    JOIN user_profiles coach ON coach.gym_id = g.gym_id
    WHERE g.id = registrations.gymnast_id
    AND coach.id = auth.uid()
    AND coach.role IN ('coach', 'gym_admin')
  )
);
CREATE POLICY "Gymnasts can create registrations" ON registrations FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM gymnasts 
    WHERE id = registrations.gymnast_id 
    AND user_id = auth.uid()
  )
);
CREATE POLICY "Coaches can approve registrations" ON registrations FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM gymnasts g
    JOIN user_profiles coach ON coach.gym_id = g.gym_id
    WHERE g.id = registrations.gymnast_id
    AND coach.id = auth.uid()
    AND coach.role IN ('coach', 'gym_admin')
  )
);

-- RLS Policies for challenges
CREATE POLICY "Challenges are viewable by everyone" ON challenges FOR SELECT USING (is_active = true);
CREATE POLICY "Admins and coaches can create challenges" ON challenges FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'coach', 'gym_admin')
  )
);

-- RLS Policies for challenge_completions
CREATE POLICY "Users can view their own completions" ON challenge_completions FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM gymnasts 
    WHERE id = challenge_completions.gymnast_id 
    AND user_id = auth.uid()
  )
);
CREATE POLICY "Gymnasts can submit completions" ON challenge_completions FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM gymnasts 
    WHERE id = challenge_completions.gymnast_id 
    AND user_id = auth.uid()
  )
);
CREATE POLICY "Coaches can approve completions" ON challenge_completions FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM gymnasts g
    JOIN user_profiles coach ON coach.gym_id = g.gym_id
    WHERE g.id = challenge_completions.gymnast_id
    AND coach.id = auth.uid()
    AND coach.role IN ('coach', 'gym_admin')
  )
);

-- RLS Policies for payments
CREATE POLICY "Users can view their own payments" ON payments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all payments" ON payments FOR SELECT USING (
  EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'admin')
);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_gym_id ON user_profiles(gym_id);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_gymnasts_gym_id ON gymnasts(gym_id);
CREATE INDEX idx_gymnasts_user_id ON gymnasts(user_id);
CREATE INDEX idx_events_host_gym_id ON events(host_gym_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_registrations_event_id ON registrations(event_id);
CREATE INDEX idx_registrations_gymnast_id ON registrations(gymnast_id);
CREATE INDEX idx_registrations_status ON registrations(status);
CREATE INDEX idx_challenge_completions_gymnast_id ON challenge_completions(gymnast_id);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON gyms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gymnasts_updated_at BEFORE UPDATE ON gymnasts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_challenge_completions_updated_at BEFORE UPDATE ON challenge_completions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update gymnast total points
CREATE OR REPLACE FUNCTION update_gymnast_points()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'approved' AND OLD.status != 'approved' THEN
        UPDATE gymnasts 
        SET total_points = total_points + NEW.points_awarded
        WHERE id = NEW.gymnast_id;
    ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
        UPDATE gymnasts 
        SET total_points = total_points - OLD.points_awarded
        WHERE id = NEW.gymnast_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_gymnast_points_trigger 
    AFTER UPDATE ON challenge_completions 
    FOR EACH ROW EXECUTE FUNCTION update_gymnast_points();