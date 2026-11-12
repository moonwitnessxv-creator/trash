import crypto from 'node:crypto';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAdminKey } from '../lib/auth';
import { getDbPool } from '../lib/db';

type ProjectRow = {
  id: string;
  tenant_id: string;
  name: string;
  database_name: string;
  status: string;
  created_at: string;
};

const createProjectSchema = z.object({
  tenantId: z.string().min(1),
  name: z.string().min(1),
  databaseName: z.string().min(1).optional()
});

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
}

export const projectRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', requireAdminKey);

  app.get('/', async (request, reply) => {
    const tenantId = typeof request.query === 'object' ? (request.query as { tenantId?: string }).tenantId : undefined;
    const pool = getDbPool();

    const query = tenantId?.trim()
      ? 'select id, tenant_id, name, database_name, status, created_at from projects where tenant_id = $1 order by created_at desc'
      : 'select id, tenant_id, name, database_name, status, created_at from projects order by created_at desc limit 100';

    const { rows } = tenantId?.trim()
      ? await pool.query<ProjectRow>(query, [tenantId.trim()])
      : await pool.query<ProjectRow>(query);

    return { projects: rows };
  });

  app.post('/', async (request, reply) => {
    const parsed = createProjectSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: 'invalid payload',
        issues: parsed.error.flatten()
      });
    }

    const tenantId = parsed.data.tenantId.trim();
    const name = parsed.data.name.trim();
    const databaseName = parsed.data.databaseName?.trim() || `${slugify(name)}_${crypto.randomUUID().slice(0, 8)}`;

    const { rows } = await getDbPool().query<ProjectRow>(
      `insert into projects (tenant_id, name, database_name)
       values ($1, $2, $3)
       returning id, tenant_id, name, database_name, status, created_at`,
      [tenantId, name, databaseName]
    );

    return reply.code(201).send({ project: rows[0] });
  });
};
