import Fastify from 'fastify';
import { healthRoutes } from './routes/health';
import { tenantRoutes } from './routes/tenants';
import { getAdminApiEnv } from './lib/env';

const env = getAdminApiEnv();
const app = Fastify({ logger: true });

app.register(healthRoutes);
app.register(tenantRoutes, { prefix: '/tenants' });

app.get('/', async () => ({
  name: 'trash-admin-api',
  status: 'ok'
}));

async function main() {
  try {
    await app.listen({ port: env.port, host: '0.0.0.0' });
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void main();
