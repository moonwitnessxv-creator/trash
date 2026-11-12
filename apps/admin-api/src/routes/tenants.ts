import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { getDbPool } from '../lib/db';

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  created_at: string;
};

const createTenantSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  ownerUserId: z.string().min(1).optional()
});

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

export const tenantRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => {
    const { rows } = await getDbPool().query<TenantRow>(
      'select id, name, slug, status, created_at from tenants order by created_at desc limit 100'
    );

    return { tenants: rows };
  });

  app.post('/', async (request, reply) => {
    const parsed = createTenantSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: 'invalid payload',
        issues: parsed.error.flatten()
      });
    }

    const name = parsed.data.name.trim();
    const slug = parsed.data.slug?.trim() || slugify(name);
    const ownerUserId = parsed.data.ownerUserId?.trim();
    const pool = getDbPool();
    const client = await pool.connect();

    try {
      await client.query('begin');

      const tenantResult = await client.query<TenantRow>(
        `insert into tenants (name, slug)
         values ($1, $2)
         returning id, name, slug, status, created_at`,
        [name, slug]
      );

      const tenant = tenantResult.rows[0];

      if (ownerUserId) {
        await client.query(
          `insert into tenant_members (tenant_id, user_id, role)
           values ($1, $2, 'owner')
           on conflict (tenant_id, user_id) do update set role = excluded.role`,
          [tenant.id, ownerUserId]
        );
      }

      await client.query('commit');

      return reply.code(201).send({ tenant });
    } catch (error) {
      await client.query('rollback');

      const message = error instanceof Error ? error.message : 'failed to create tenant';
      return reply.code(500).send({ error: message });
    } finally {
      client.release();
    }
  });
};
