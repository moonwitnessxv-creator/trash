import type { FastifyPluginAsync } from 'fastify';
import { getSupabaseAdmin } from '../lib/supabase';

type CreateTenantBody = {
  name?: string;
  ownerUserId?: string;
};

export const tenantRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async (_request, reply) => {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('tenants')
      .select('id,name,created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return reply.code(500).send({ error: error.message });
    }

    return {
      tenants: data ?? []
    };
  });

  app.post('/', async (request, reply) => {
    const body = request.body as CreateTenantBody | undefined;
    const name = body?.name?.trim();

    if (!name) {
      return reply.code(400).send({ error: 'name is required' });
    }

    const supabase = getSupabaseAdmin();
    const { data: tenant, error } = await supabase
      .from('tenants')
      .insert({ name })
      .select('id,name,created_at')
      .single();

    if (error || !tenant) {
      return reply.code(500).send({ error: error?.message ?? 'failed to create tenant' });
    }

    if (body?.ownerUserId?.trim()) {
      const { error: memberError } = await supabase.from('tenant_members').insert({
        tenant_id: tenant.id,
        user_id: body.ownerUserId.trim(),
        role: 'owner'
      });

      if (memberError) {
        return reply.code(500).send({ error: memberError.message });
      }
    }

    return reply.code(201).send({ tenant });
  });
};
