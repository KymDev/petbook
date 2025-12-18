import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    'VITE_SUPABASE_URL is not defined. Please check your .env.local file.'
  );
}

if (!SUPABASE_ANON_KEY) {
  throw new Error(
    'VITE_SUPABASE_PUBLISHABLE_KEY is not defined. Please check your .env.local file.'
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
