import type { FastifyReply, FastifyRequest } from 'fastify';
import { timingSafeEqual } from 'node:crypto';
import { getAdminApiEnv } from './env';

function normalize(value: string) {
  return Buffer.from(value, 'utf8');
}

export async function requireAdminKey(request: FastifyRequest, reply: FastifyReply) {
  const env = getAdminApiEnv();
  const provided = request.headers['x-trash-admin-key'];
  const expected = env.adminApiKey;

  if (typeof provided !== 'string' || provided.length === 0) {
    return reply.code(401).send({ error: 'missing admin key' });
  }

  const providedBuffer = normalize(provided);
  const expectedBuffer = normalize(expected);

  if (providedBuffer.length !== expectedBuffer.length || !timingSafeEqual(providedBuffer, expectedBuffer)) {
    return reply.code(401).send({ error: 'invalid admin key' });
  }
}
