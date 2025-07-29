import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

export const supabase: SupabaseClient<Database> = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey)
  // @ts-expect-error - create a dummy client to avoid runtime crashes in demo mode
  : (createClient('https://demo.supabase.co', 'demo-key') as SupabaseClient<Database>);

// Auth helpers
export const signUp = async (
  email: string,
  password: string,
  userData: Database['public']['Tables']['user_profiles']['Insert']
) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
      emailRedirectTo: undefined,
      emailConfirmation: false
    },
  });
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Database helpers
export const getUserProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select(`
      *,
      gym:gyms(*)
    `)
    .eq('id', userId)
    .single();
  
  return { data, error };
};

export const getGymnastProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from('gymnasts')
    .select(`
      *,
      user:user_profiles(*),
      gym:gyms(*)
    `)
    .eq('user_id', userId)
    .single();
  
  return { data, error };
};

export const getEvents = async (status?: string) => {
  let query = supabase
    .from('events')
    .select(`
      *,
      host_gym:gyms(*),
      creator:user_profiles(*)
    `)
    .order('event_date', { ascending: true });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  return { data, error };
};

export const getRegistrations = async (eventId?: string, gymnastId?: string) => {
  let query = supabase
    .from('registrations')
    .select(`
      *,
      event:events(*),
      gymnast:gymnasts(
        *,
        user:user_profiles(*)
      )
    `);

  if (eventId) {
    query = query.eq('event_id', eventId);
  }
  
  if (gymnastId) {
    query = query.eq('gymnast_id', gymnastId);
  }

  const { data, error } = await query;
  return { data, error };
};

export const getChallenges = async (isActive = true) => {
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('is_active', isActive)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const getChallengeCompletions = async (gymnastId?: string, challengeId?: string) => {
  let query = supabase
    .from('challenge_completions')
    .select(`
      *,
      challenge:challenges(*),
      gymnast:gymnasts(
        *,
        user:user_profiles(*)
      )
    `);

  if (gymnastId) {
    query = query.eq('gymnast_id', gymnastId);
  }
  
  if (challengeId) {
    query = query.eq('challenge_id', challengeId);
  }

  const { data, error } = await query;
  return { data, error };
};

export const getGymnastsByGym = async (gymId: string) => {
  const { data, error } = await supabase
    .from('gymnasts')
    .select(`
      *,
      user:user_profiles(*)
    `)
    .eq('gym_id', gymId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const getNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  
  return { data, error };
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  return { data, error };
};

// Creation helpers
export const createEvent = async (
  event: Database['public']['Tables']['events']['Insert']
) => {
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .single();
  return { data, error };
};

// Real-time subscriptions
import type {
  RealtimePostgresChangesPayload,
} from '@supabase/realtime-js';

export const subscribeToRegistrations = (
  callback: (
    payload: RealtimePostgresChangesPayload<
      Database['public']['Tables']['registrations']['Row']
    >
  ) => void
) => {
  return supabase
    .channel('registrations')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'registrations' }, 
      callback
    )
    .subscribe();
};

export const subscribeToNotifications = (
  userId: string,
  callback: (
    payload: RealtimePostgresChangesPayload<
      Database['public']['Tables']['notifications']['Row']
    >
  ) => void
) => {
  return supabase
    .channel('notifications')
    .on('postgres_changes', 
      { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, 
      callback
    )
    .subscribe();
};
