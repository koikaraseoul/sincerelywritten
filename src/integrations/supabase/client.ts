import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = "https://cyqvssbyewwpnkmqgvaz.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5cXZzc2J5ZXd3cG5rbXFndmF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA0MzkxMTMsImV4cCI6MjA0NjAxNTExM30.nKstp_UYxjCCmylvIRBVGrjna1bchEKx9yMpcM9wfbw";

// Create a single instance of the Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Prevent creation of multiple instances
Object.freeze(supabase);