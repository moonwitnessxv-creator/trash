export type AdminApiEnv = {
  port: number;
  postgresUrl: string;
  postgresSsl: boolean;
};

function required(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export function getAdminApiEnv(): AdminApiEnv {
  return {
    port: Number(process.env.PORT ?? 3001),
    postgresUrl: required('POSTGRES_URL', 'postgresql://trash:trash@postgres:5432/trash'),
    postgresSsl: (process.env.POSTGRES_SSL ?? 'false') === 'true'
  };
}
