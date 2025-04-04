'use server';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

/**
 * Create a server-safe Supabase client or dummy client when in dev mode
 */
export async function createServerSupabaseClient() {
  // Use a browser client as a workaround for server cookies issues
  return await createBrowserSupabaseClient();
}

/**
 * Create a Supabase client that works in both development and production
 */
export async function createBrowserSupabaseClient() {
  try {
    // Check for environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    // Return dummy client if environment variables are not set
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Supabase environment variables not properly configured, using dummy client');
      return createDummyClient();
    }
    
    // Create browser client
    return createBrowserClient<Database>(
      supabaseUrl,
      supabaseAnonKey
    );
  } catch (error) {
    console.error('Error creating Supabase client:', error);
    return createDummyClient();
  }
}

/**
 * Create a dummy client for development when Supabase isn't configured
 */
async function createDummyClient() {
  return {
    auth: {
      getSession: async () => ({ data: { session: null }, error: null }),
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithPassword: async () => ({ data: { user: null, session: null }, error: null }),
      signUp: async () => ({ data: { user: null, session: null }, error: null }),
      signOut: async () => ({ error: null }),
    },
  };
}

/**
 * Get the current session
 */
export async function getServerSession() {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Error getting server session:', error);
    return null;
  }
}

/**
 * Get the current user
 */
export async function getServerUser() {
  try {
    const session = await getServerSession();
    return session?.user || null;
  } catch (error) {
    console.error('Error getting server user:', error);
    return null;
  }
} 