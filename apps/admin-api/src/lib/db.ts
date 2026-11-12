import { Pool } from 'pg';
import { getAdminApiEnv } from './env';

let pool: Pool | null = null;

export function getDbPool() {
  if (!pool) {
    const env = getAdminApiEnv();

    pool = new Pool({
      connectionString: env.postgresUrl,
      ssl: env.postgresSsl ? { rejectUnauthorized: false } : undefined
    });
  }

  return pool;
}
