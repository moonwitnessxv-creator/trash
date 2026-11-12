import crypto from 'node:crypto';
import type { FastifyPluginAsync } from 'fastify';

export type TenantRecord = {
  id: string;
  name: string;
  status: 'created' | 'active' | 'suspended';
  createdAt: string;
};

const tenants = new Map<string, TenantRecord>();

export const tenantRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => ({ tenants: Array.from(tenants.values()) }));

  app.post('/', async (request, reply) => {
    const body = request.body as { name?: string } | undefined;

    if (!body?.name?.trim()) {
      return reply.code(400).send({ error: 'name is required' });
    }

    const tenant: TenantRecord = {
      id: crypto.randomUUID(),
      name: body.name.trim(),
      status: 'created',
      createdAt: new Date().toISOString()
    };

    tenants.set(tenant.id, tenant);

    return reply.code(201).send({ tenant });
  });
};
