import { createClient, type SupabaseClient } from '@supabase/supabase-js';

export type TrashClientOptions = {
  supabaseUrl: string;
  anonKey: string;
};

export type Tenant = {
  id: string;
  name: string;
  created_at?: string;
  status?: string;
};

export type CreateTenantInput = {
  name: string;
  ownerUserId?: string;
};

export type AdminApiClient = {
  baseUrl: string;
  health: () => Promise<{ ok: boolean }>;
  listTenants: () => Promise<Tenant[]>;
  createTenant: (input: CreateTenantInput) => Promise<{ tenant: Tenant }>;
};

function normalizeBaseUrl(baseUrl: string) {
  return baseUrl.replace(/\/+$/, '');
}

async function readJson<T>(response: Response): Promise<T> {
  const body = await response.text();

  if (!response.ok) {
    throw new Error(body || `${response.status} ${response.statusText}`);
  }

  return (body ? JSON.parse(body) : {}) as T;
}

export function createTrashClient(options: TrashClientOptions): SupabaseClient {
  return createClient(options.supabaseUrl, options.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false
    }
  });
}

export function createAdminApiClient(options: { baseUrl: string }): AdminApiClient {
  const baseUrl = normalizeBaseUrl(options.baseUrl);

  return {
    baseUrl,
    async health() {
      return readJson<{ ok: boolean }>(await fetch(`${baseUrl}/health`));
    },
    async listTenants() {
      const result = await readJson<{ tenants: Tenant[] }>(await fetch(`${baseUrl}/tenants`));
      return result.tenants ?? [];
    },
    async createTenant(input) {
      return readJson<{ tenant: Tenant }>(
        await fetch(`${baseUrl}/tenants`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(input)
        })
      );
    }
  };
}

export function createTenantPayload(name: string, ownerUserId?: string) {
  const payload: CreateTenantInput = {
    name: name.trim()
  };

  if (ownerUserId?.trim()) {
    payload.ownerUserId = ownerUserId.trim();
  }

  return payload;
}
