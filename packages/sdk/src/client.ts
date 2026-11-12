import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type TrashClientOptions = {
  supabaseUrl: string;
  anonKey: string;
};

export type Tenant = {
  id: string;
  name: string;
};

export function createTrashClient(options: TrashClientOptions): SupabaseClient {
  return createClient(options.supabaseUrl, options.anonKey);
}

export function createTenantPayload(name: string) {
  return {
    name: name.trim()
  };
}
