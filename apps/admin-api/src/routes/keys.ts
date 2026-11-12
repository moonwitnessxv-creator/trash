import crypto from 'node:crypto';
import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAdminKey } from '../lib/auth';
import { getDbPool } from '../lib/db';

type ApiKeyRow = {
  id: string;
  tenant_id: string;
  label: string;
  key_prefix: string;
  last_used_at: string | null;
  created_at: string;
};

const createKeySchema = z.object({
  tenantId: z.string().min(1),
  label: z.string().min(1)
});

function hashKey(secret: string) {
  return crypto.createHash('sha256').update(secret).digest('hex');
}

function buildKeySecret() {
  const random = crypto.randomBytes(32).toString('base64url');
  return `trash_${random}`;
}

export const keyRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', requireAdminKey);

  app.get('/', async (request, reply) => {
    const tenantId = typeof request.query === 'object' ? (request.query as { tenantId?: string }).tenantId : undefined;
    const pool = getDbPool();

    const query = tenantId?.trim()
      ? 'select id, tenant_id, label, key_prefix, last_used_at, created_at from api_keys where tenant_id = $1 order by created_at desc'
      : 'select id, tenant_id, label, key_prefix, last_used_at, created_at from api_keys order by created_at desc limit 100';

    const { rows } = tenantId?.trim()
      ? await pool.query<ApiKeyRow>(query, [tenantId.trim()])
      : await pool.query<ApiKeyRow>(query);

    return { keys: rows };
  });

  app.post('/', async (request, reply) => {
    const parsed = createKeySchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: 'invalid payload',
        issues: parsed.error.flatten()
      });
    }

    const tenantId = parsed.data.tenantId.trim();
    const label = parsed.data.label.trim();
    const secret = buildKeySecret();
    const keyPrefix = secret.slice(0, 12);
    const keyHash = hashKey(secret);

    const { rows } = await getDbPool().query<ApiKeyRow>(
      `insert into api_keys (tenant_id, label, key_prefix, key_hash)
       values ($1, $2, $3, $4)
       returning id, tenant_id, label, key_prefix, last_used_at, created_at`,
      [tenantId, label, keyPrefix, keyHash]
    );

    return reply.code(201).send({
      key: rows[0],
      secret
    });
  });
};
