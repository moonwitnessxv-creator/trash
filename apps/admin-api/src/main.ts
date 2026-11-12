import Fastify from 'fastify';
import { getAdminApiEnv } from './lib/env';
import { healthRoutes } from './routes/health';
import { keyRoutes } from './routes/keys';
import { projectRoutes } from './routes/projects';
import { tenantRoutes } from './routes/tenants';

const env = getAdminApiEnv();
const app = Fastify({ logger: true });

app.register(healthRoutes, { prefix: '/health' });
app.register(tenantRoutes, { prefix: '/tenants' });
app.register(projectRoutes, { prefix: '/projects' });
app.register(keyRoutes, { prefix: '/keys' });

app.get('/', async () => ({
  name: 'trash-control-plane',
  status: 'ok',
  storage: 'postgresql'
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
