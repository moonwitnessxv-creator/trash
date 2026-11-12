import type { FastifyPluginAsync } from 'fastify';
import { getDbPool } from '../lib/db';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => ({ ok: true }));

  app.get('/ready', async (_request, reply) => {
    try {
      const { rows } = await getDbPool().query('select 1 as ready');
      return {
        ready: rows[0]?.ready === 1
      };
    } catch (error) {
      return reply.code(503).send({
        ready: false,
        error: error instanceof Error ? error.message : 'database unavailable'
      });
    }
  });
};
