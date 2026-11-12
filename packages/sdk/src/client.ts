export type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
};

export type Member = {
  tenant_id: string;
  user_id: string;
  role: string;
  created_at: string;
};

export type Project = {
  id: string;
  tenant_id: string;
  name: string;
  database_name: string;
  status: string;
  created_at: string;
};

export type ApiKey = {
  id: string;
  tenant_id: string;
  label: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
};

export type CreateTenantInput = {
  name: string;
  slug?: string;
  ownerUserId?: string;
};

export type CreateMemberInput = {
  tenantId: string;
  userId: string;
  role?: string;
};

export type CreateProjectInput = {
  tenantId: string;
  name: string;
  databaseName?: string;
};

export type CreateApiKeyInput = {
  tenantId: string;
  label: string;
};

export type ControlPlaneClient = {
  baseUrl: string;
  health: () => Promise<{ ok: boolean }>;
  ready: () => Promise<{ ready: boolean }>;
  listTenants: () => Promise<Tenant[]>;
  createTenant: (input: CreateTenantInput) => Promise<{ tenant: Tenant }>;
  listMembers: (tenantId: string) => Promise<Member[]>;
  createMember: (input: CreateMemberInput) => Promise<{ member: Member }>;
  listProjects: (tenantId?: string) => Promise<Project[]>;
  createProject: (input: CreateProjectInput) => Promise<{ project: Project }>;
  listKeys: (tenantId?: string) => Promise<ApiKey[]>;
  createKey: (input: CreateApiKeyInput) => Promise<{ key: ApiKey; secret: string }>;
};

export type ControlPlaneClientOptions = {
  baseUrl: string;
  adminKey?: string;
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

function withAdminHeaders(headers: HeadersInit | undefined, adminKey?: string): HeadersInit | undefined {
  if (!adminKey) {
    return headers;
  }

  return {
    ...(headers ?? {}),
    'x-trash-admin-key': adminKey
  };
}

export function createControlPlaneClient(options: ControlPlaneClientOptions): ControlPlaneClient {
  const baseUrl = normalizeBaseUrl(options.baseUrl);
  const headers = withAdminHeaders(undefined, options.adminKey);

  return {
    baseUrl,
    async health() {
      return readJson<{ ok: boolean }>(await fetch(`${baseUrl}/health`));
    },
    async ready() {
      return readJson<{ ready: boolean }>(await fetch(`${baseUrl}/health/ready`));
    },
    async listTenants() {
      const result = await readJson<{ tenants: Tenant[] }>(
        await fetch(`${baseUrl}/tenants`, { headers })
      );
      return result.tenants ?? [];
    },
    async createTenant(input) {
      return readJson<{ tenant: Tenant }>(
        await fetch(`${baseUrl}/tenants`, {
          method: 'POST',
          headers: withAdminHeaders({ 'Content-Type': 'application/json' }, options.adminKey),
          body: JSON.stringify(input)
        })
      );
    },
    async listMembers(tenantId) {
      const result = await readJson<{ members: Member[] }>(
        await fetch(`${baseUrl}/tenants/${encodeURIComponent(tenantId)}/members`, { headers })
      );
      return result.members ?? [];
    },
    async createMember(input) {
      return readJson<{ member: Member }>(
        await fetch(`${baseUrl}/tenants/${encodeURIComponent(input.tenantId)}/members`, {
          method: 'POST',
          headers: withAdminHeaders({ 'Content-Type': 'application/json' }, options.adminKey),
          body: JSON.stringify({
            userId: input.userId,
            role: input.role
          })
        })
      );
    },
    async listProjects(tenantId) {
      const url = new URL(`${baseUrl}/projects`);
      if (tenantId?.trim()) {
        url.searchParams.set('tenantId', tenantId.trim());
      }

      const result = await readJson<{ projects: Project[] }>(await fetch(url, { headers }));
      return result.projects ?? [];
    },
    async createProject(input) {
      return readJson<{ project: Project }>(
        await fetch(`${baseUrl}/projects`, {
          method: 'POST',
          headers: withAdminHeaders({ 'Content-Type': 'application/json' }, options.adminKey),
          body: JSON.stringify(input)
        })
      );
    },
    async listKeys(tenantId) {
      const url = new URL(`${baseUrl}/keys`);
      if (tenantId?.trim()) {
        url.searchParams.set('tenantId', tenantId.trim());
      }

      const result = await readJson<{ keys: ApiKey[] }>(await fetch(url, { headers }));
      return result.keys ?? [];
    },
    async createKey(input) {
      return readJson<{ key: ApiKey; secret: string }>(
        await fetch(`${baseUrl}/keys`, {
          method: 'POST',
          headers: withAdminHeaders({ 'Content-Type': 'application/json' }, options.adminKey),
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

export function createMemberPayload(tenantId: string, userId: string, role?: string) {
  const payload: CreateMemberInput = {
    tenantId: tenantId.trim(),
    userId: userId.trim()
  };

  if (role?.trim()) {
    payload.role = role.trim();
  }

  return payload;
}

export function createProjectPayload(name: string, tenantId: string, databaseName?: string) {
  const payload: CreateProjectInput = {
    tenantId: tenantId.trim(),
    name: name.trim()
  };

  if (databaseName?.trim()) {
    payload.databaseName = databaseName.trim();
  }

  return payload;
}

export function createApiKeyPayload(label: string, tenantId: string) {
  return {
    tenantId: tenantId.trim(),
    label: label.trim()
  } satisfies CreateApiKeyInput;
}
