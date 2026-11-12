import type { FastifyPluginAsync } from 'fastify';

export const healthRoutes: FastifyPluginAsync = async (app) => {
  app.get('/', async () => ({ ok: true }));
  app.get('/ready', async () => ({ ready: true }));
};
