import type { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { requireAdminKey } from '../lib/auth';
import { getDbPool } from '../lib/db';

type MemberRow = {
  tenant_id: string;
  user_id: string;
  role: string;
  created_at: string;
};

const addMemberSchema = z.object({
  userId: z.string().min(1),
  role: z.string().min(1).optional()
});

export const memberRoutes: FastifyPluginAsync = async (app) => {
  app.addHook('preHandler', requireAdminKey);

  app.get('/:tenantId/members', async (request) => {
    const tenantId = (request.params as { tenantId: string }).tenantId.trim();
    const { rows } = await getDbPool().query<MemberRow>(
      'select tenant_id, user_id, role, created_at from tenant_members where tenant_id = $1 order by created_at desc',
      [tenantId]
    );

    return { members: rows };
  });

  app.post('/:tenantId/members', async (request, reply) => {
    const tenantId = (request.params as { tenantId: string }).tenantId.trim();
    const parsed = addMemberSchema.safeParse(request.body);

    if (!parsed.success) {
      return reply.code(400).send({
        error: 'invalid payload',
        issues: parsed.error.flatten()
      });
    }

    const { rows } = await getDbPool().query<MemberRow>(
      `insert into tenant_members (tenant_id, user_id, role)
       values ($1, $2, $3)
       on conflict (tenant_id, user_id) do update set role = excluded.role
       returning tenant_id, user_id, role, created_at`,
      [tenantId, parsed.data.userId.trim(), parsed.data.role?.trim() || 'member']
    );

    return reply.code(201).send({ member: rows[0] });
  });
};
