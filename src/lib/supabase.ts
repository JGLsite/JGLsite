import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { log as devLog, error as devError } from './logger';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

devLog('[supabase] VITE_SUPABASE_URL:', supabaseUrl || '<missing>');
devLog('[supabase] VITE_SUPABASE_ANON_KEY present:', !!supabaseAnonKey);

export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (import.meta.env.DEV) {
  if (isSupabaseConfigured) {
    devLog('[supabase] Client initialized with provided credentials');
  } else {
    devError('[supabase] Missing credentials, using demo client');
  }
}

const loggingFetch = async (url: string, options?: RequestInit) => {
  const start = Date.now();
  devLog('[supabase] fetch', options?.method || 'GET', url);
  try {
    const res = await fetch(url, options);
    devLog(
      '[supabase] response',
      res.status,
      url,
      `${Date.now() - start}ms`
    );
    return res;
  } catch (err) {
    devError('[supabase] fetch error:', err);
    throw err;
  }
};

export const supabase: SupabaseClient<Database> = isSupabaseConfigured
  ? createClient<Database>(supabaseUrl, supabaseAnonKey, { global: { fetch: loggingFetch } })
  // @ts-expect-error - create a dummy client to avoid runtime crashes in demo mode
  : (createClient('https://demo.supabase.co', 'demo-key', { global: { fetch: loggingFetch } }) as SupabaseClient<Database>);

// Auth helpers
export const signUp = async (
  email: string,
  password: string,
  userData: Database['public']['Tables']['user_profiles']['Insert']
) => {
  devLog('[supabase] signUp', email);
  
  // First create the auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (authError) {
    devError('[supabase] signUp auth error:', authError);
    return { data: null, error: authError };
  }
  
  if (!authData.user) {
    return { data: null, error: new Error('No user returned from signup') };
  }
  
  // Then create the user profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      ...userData,
      id: authData.user.id,
    });
  
  if (profileError) {
    devError('[supabase] signUp profile error:', profileError);
    return { data: authData, error: profileError };
  }
  
  return { data: authData, error: null };
};

export const signIn = async (email: string, password: string) => {
  devLog('[supabase] signIn', email);
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  devLog('[supabase] signIn result:', { user: data?.user?.id, session: !!data?.session, error });
  if (error) {
    devError('[supabase] signIn error:', error);
  }
  return { data, error };
};

export const signOut = async () => {
  devLog('[supabase] signOut');
  const { error } = await supabase.auth.signOut();
  if (error) {
    devError('[supabase] signOut error:', error);
  }
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Database helpers
export const getUserProfile = async (userId: string) => {
  devLog('[supabase] getUserProfile for', userId);
  
  // Check if Supabase is configured, if not return null immediately
  if (!isSupabaseConfigured) {
    devLog('[supabase] Supabase not configured, returning null profile');
    return { data: null, error: null };
  }

  try {
    devLog('[supabase] getUserProfile try begin');

    // Create a timeout promise
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Profile query timeout')), 30000);
    });

    // Create the actual query promise
    const queryPromise = supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // Race between timeout and query
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]);
    
    devLog('[supabase] getUserProfile after await supabase');

    if (error) {
      devError('[supabase] getUserProfile error:', error);
      return { data: null, error };
    }
    
    if (!data) {
      devLog('[supabase] No user profile found for user:', userId);
      return { data: null, error: null };
    }
    
    devLog('[supabase] getUserProfile result:', data);
    return { data, error: null };
    
  } catch (err) {
    devError('[supabase] getUserProfile exception:', err);
    return { data: null, error: err };
  }
};

export const getGymnastProfile = async (userId: string) => {
  devLog('[supabase] getGymnastProfile for', userId);
  const { data, error } = await supabase
    .from('gymnasts')
    .select(`
      *,
      user:user_profiles(*),
      gym:gyms(*)
    `)
    .eq('user_id', userId)
    .single();

  if (error) {
    devError('[supabase] getGymnastProfile error:', error);
  } else {
    devLog('[supabase] getGymnastProfile result:', data);
  }

  return { data, error };
};

export const getEvents = async (status?: string) => {
  devLog('[supabase] getEvents status:', status);
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
  if (error) {
    devError('[supabase] getEvents error:', error);
  } else {
    devLog('[supabase] getEvents result count:', data?.length);
  }
  return { data, error };
};

export const getRegistrations = async (eventId?: string, gymnastId?: string) => {
  devLog('[supabase] getRegistrations eventId:', eventId, 'gymnastId:', gymnastId);
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
  if (error) {
    devError('[supabase] getRegistrations error:', error);
  } else {
    devLog('[supabase] getRegistrations result count:', data?.length);
  }
  return { data, error };
};

export const getChallenges = async (isActive = true) => {
  devLog('[supabase] getChallenges isActive:', isActive);
  const { data, error } = await supabase
    .from('challenges')
    .select('*')
    .eq('is_active', isActive)
    .order('created_at', { ascending: false });

  if (error) {
    devError('[supabase] getChallenges error:', error);
  } else {
    devLog('[supabase] getChallenges result count:', data?.length);
  }

  return { data, error };
};

export const getChallengeCompletions = async (gymnastId?: string, challengeId?: string) => {
  devLog('[supabase] getChallengeCompletions gymnastId:', gymnastId, 'challengeId:', challengeId);
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
  if (error) {
    devError('[supabase] getChallengeCompletions error:', error);
  } else {
    devLog('[supabase] getChallengeCompletions result count:', data?.length);
  }
  return { data, error };
};

export const getGymnastsByGym = async (gymId: string) => {
  devLog('[supabase] getGymnastsByGym gymId:', gymId);
  const { data, error } = await supabase
    .from('gymnasts')
    .select(`
      *,
      user:user_profiles(*)
    `)
    .eq('gym_id', gymId)
    .order('created_at', { ascending: false });
  
  if (error) {
    devError('[supabase] getGymnastsByGym error:', error);
  } else {
    devLog('[supabase] getGymnastsByGym result count:', data?.length);
  }
  return { data, error };
};

export const getGyms = async () => {
  devLog('[supabase] getGyms');
  const { data, error } = await supabase
    .from('gyms')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    devError('[supabase] getGyms error:', error);
  } else {
    devLog('[supabase] getGyms result count:', data?.length);
  }

  return { data, error };
};

export const getNotifications = async (userId: string) => {
  devLog('[supabase] getNotifications userId:', userId);
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    devError('[supabase] getNotifications error:', error);
  } else {
    devLog('[supabase] getNotifications result count:', data?.length);
  }

  return { data, error };
};

export const markNotificationAsRead = async (notificationId: string) => {
  devLog('[supabase] markNotificationAsRead id:', notificationId);
  const { data, error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) {
    devError('[supabase] markNotificationAsRead error:', error);
  } else {
    devLog('[supabase] markNotificationAsRead success');
  }

  return { data, error };
};

// Creation helpers
export const createEvent = async (
  event: Database['public']['Tables']['events']['Insert']
) => {
  devLog('[supabase] createEvent', event);
  const { data, error } = await supabase
    .from('events')
    .insert(event)
    .single();
  if (error) {
    devError('[supabase] createEvent error:', error);
  } else {
    devLog('[supabase] createEvent id:', data?.id);
  }
  return { data, error };
};

export const updateEvent = async (
  id: string,
  updates: Database['public']['Tables']['events']['Update']
) => {
  devLog('[supabase] updateEvent id:', id, 'updates:', updates);
  const { data, error } = await supabase
    .from('events')
    .update(updates)
    .eq('id', id)
    .single();
  if (error) {
    devError('[supabase] updateEvent error:', error);
  } else {
    devLog('[supabase] updateEvent updated id:', data?.id);
  }
  return { data, error };
};

export const deleteEvent = async (id: string) => {
  devLog('[supabase] deleteEvent id:', id);
  const { error } = await supabase.from('events').delete().eq('id', id);
  if (error) {
    devError('[supabase] deleteEvent error:', error);
  } else {
    devLog('[supabase] deleteEvent success');
  }
  return { error };
};

export const createGym = async (
  gym: Database['public']['Tables']['gyms']['Insert']
) => {
  devLog('[supabase] createGym', gym);
  const { data, error } = await supabase
    .from('gyms')
    .insert(gym)
    .single();
  if (error) {
    devError('[supabase] createGym error:', error);
  } else {
    devLog('[supabase] createGym id:', data?.id);
  }
  return { data, error };
};

export const createMember = async (
  member: Database['public']['Tables']['user_profiles']['Insert']
) => {
  devLog('[supabase] createMember', member);
  const { data, error } = await supabase
    .from('user_profiles')
    .insert(member)
    .single();
  if (error) {
    devError('[supabase] createMember error:', error);
  } else {
    devLog('[supabase] createMember id:', data?.id);
  }
  return { data, error };
};

export const updateMember = async (
  id: string,
  updates: Database['public']['Tables']['user_profiles']['Update']
) => {
  devLog('[supabase] updateMember id:', id, 'updates:', updates);
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', id)
    .single();
  if (error) {
    devError('[supabase] updateMember error:', error);
  } else {
    devLog('[supabase] updateMember updated id:', data?.id);
  }
  return { data, error };
};

export const deleteMember = async (id: string) => {
  devLog('[supabase] deleteMember id:', id);
  const { error } = await supabase.from('user_profiles').delete().eq('id', id);
  if (error) {
    devError('[supabase] deleteMember error:', error);
  } else {
    devLog('[supabase] deleteMember success');
  }
  return { error };
};

export const updateGym = async (
  id: string,
  updates: Database['public']['Tables']['gyms']['Update']
) => {
  devLog('[supabase] updateGym id:', id, 'updates:', updates);
  const { data, error } = await supabase
    .from('gyms')
    .update(updates)
    .eq('id', id)
    .single();
  if (error) {
    devError('[supabase] updateGym error:', error);
  } else {
    devLog('[supabase] updateGym updated id:', data?.id);
  }
  return { data, error };
};

export const deleteGym = async (id: string) => {
  devLog('[supabase] deleteGym id:', id);
  const { error } = await supabase.from('gyms').delete().eq('id', id);
  if (error) {
    devError('[supabase] deleteGym error:', error);
  } else {
    devLog('[supabase] deleteGym success');
  }
  return { error };
};

export const updateGymnast = async (
  id: string,
  updates: Database['public']['Tables']['gymnasts']['Update']
) => {
  devLog('[supabase] updateGymnast id:', id, 'updates:', updates);
  const { data, error } = await supabase
    .from('gymnasts')
    .update(updates)
    .eq('id', id)
    .single();
  if (error) {
    devError('[supabase] updateGymnast error:', error);
  } else {
    devLog('[supabase] updateGymnast updated id:', data?.id);
  }
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