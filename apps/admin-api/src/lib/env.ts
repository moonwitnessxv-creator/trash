export type AdminApiEnv = {
  port: number;
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  supabaseJwtSecret: string;
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
    supabaseUrl: required('SUPABASE_URL', 'http://localhost:54321'),
    supabaseAnonKey: required('SUPABASE_ANON_KEY', 'replace-me'),
    supabaseServiceRoleKey: required('SUPABASE_SERVICE_ROLE_KEY', 'replace-me'),
    supabaseJwtSecret: required('SUPABASE_JWT_SECRET', 'replace-me')
  };
}
