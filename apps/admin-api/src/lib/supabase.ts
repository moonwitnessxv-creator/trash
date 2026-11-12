import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { getAdminApiEnv } from './env';

let adminClient: SupabaseClient | null = null;

export function getSupabaseAdmin() {
  if (!adminClient) {
    const env = getAdminApiEnv();

    adminClient = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });
  }

  return adminClient;
}
