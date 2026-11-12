export type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
};

export type CreateTenantInput = {
  name: string;
  slug?: string;
  ownerUserId?: string;
};

export type ControlPlaneClient = {
  baseUrl: string;
  health: () => Promise<{ ok: boolean }>;
  ready: () => Promise<{ ready: boolean }>;
  listTenants: () => Promise<Tenant[]>;
  createTenant: (input: CreateTenantInput) => Promise<{ tenant: Tenant }>;
};

export type ControlPlaneClientOptions = {
  baseUrl: string;
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

export function createControlPlaneClient(options: ControlPlaneClientOptions): ControlPlaneClient {
  const baseUrl = normalizeBaseUrl(options.baseUrl);

  return {
    baseUrl,
    async health() {
      return readJson<{ ok: boolean }>(await fetch(`${baseUrl}/health`));
    },
    async ready() {
      return readJson<{ ready: boolean }>(await fetch(`${baseUrl}/health/ready`));
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

export function createTrashClient(options: ControlPlaneClientOptions) {
  return createControlPlaneClient(options);
}

export function createTenantPayload(name: string, ownerUserId?: string, slug?: string) {
  const payload: CreateTenantInput = {
    name: name.trim()
  };

  if (ownerUserId?.trim()) {
    payload.ownerUserId = ownerUserId.trim();
  }

  if (slug?.trim()) {
    payload.slug = slug.trim();
  }

  return payload;
}
