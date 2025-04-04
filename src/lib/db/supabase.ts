import { createBrowserClient } from '@supabase/ssr';
import { NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY } from '../utils/constants';
import { Database } from './database.types';

// Create a single supabase client for the client-side
const supabase = createBrowserClient<Database>(
  NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default supabase; 