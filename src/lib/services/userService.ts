import supabase from '@/lib/db/supabase';
import { User } from '@supabase/supabase-js';
import { SUBSCRIPTION_TIERS } from '@/lib/utils/constants';

/**
 * Get a user profile from Supabase
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Create a new user profile in Supabase
 */
export async function createUserProfile(user: User) {
  try {
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (existingProfile) {
      return existingProfile;
    }

    // Create new profile
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        email: user.email || '',
        first_name: null,
        last_name: null,
        subscription_tier: SUBSCRIPTION_TIERS.FREE,
        subscription_status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
}

/**
 * Update a user profile in Supabase
 */
export async function updateUserProfile(userId: string, profile: any) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...profile,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Update a user's Stripe customer ID
 */
export async function updateStripeCustomerId(userId: string, customerId: string) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        stripe_customer_id: customerId,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating Stripe customer ID:', error);
    throw error;
  }
}

/**
 * Update a user's subscription details
 */
export async function updateSubscription(
  userId: string,
  tier: string,
  status: string
) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        subscription_tier: tier,
        subscription_status: status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
} 