import { createClient } from '@supabase/supabase-js';
import { getAdminApiEnv } from './env';

export function createAdminSupabaseClient() {
  const env = getAdminApiEnv();

  return createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}
