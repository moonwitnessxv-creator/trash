import { createAdminApiClient } from '@trash/sdk';

export const dynamic = 'force-dynamic';

async function loadDashboardData() {
  const adminApiUrl = process.env.ADMIN_API_URL ?? 'http://localhost:3001';
  const client = createAdminApiClient({ baseUrl: adminApiUrl });

  try {
    const [health, tenants] = await Promise.all([client.health(), client.listTenants()]);

    return {
      ok: health.ok,
      tenants,
      error: null as string | null,
      adminApiUrl
    };
  } catch (error) {
    return {
      ok: false,
      tenants: [] as Awaited<ReturnType<typeof createAdminApiClient>> extends { listTenants: () => Promise<infer T> } ? T : never,
      error: error instanceof Error ? error.message : 'Failed to reach admin API',
      adminApiUrl
    };
  }
}

export default async function HomePage() {
  const data = await loadDashboardData();

  return (
    <main style={{ padding: 32, fontFamily: 'system-ui, sans-serif', maxWidth: 1080, margin: '0 auto' }}>
      <header style={{ marginBottom: 32 }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: 1.2, fontSize: 12, opacity: 0.7 }}>
          Trash Control Plane
        </p>
        <h1 style={{ fontSize: 40, margin: '8px 0' }}>Multi-tenant Supabase platform</h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 760 }}>
          This dashboard is the final layer: it provisions tenants, members, projects, and API keys on top of the self-hosted Supabase core.
        </p>
      </header>

      <section style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {[
          ['Tenants', 'Create and suspend customer workspaces.'],
          ['Members', 'Invite owners, admins, and collaborators.'],
          ['Keys', 'Issue publishable and admin keys.'],
          ['Audit', 'Track provisioning and usage events.']
        ].map(([title, description]) => (
          <article
            key={title}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 16,
              padding: 20,
              background: '#fff'
            }}
          >
            <h2 style={{ marginTop: 0 }}>{title}</h2>
            <p style={{ marginBottom: 0, lineHeight: 1.6 }}>{description}</p>
          </article>
        ))}
      </section>

      <section style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', marginTop: 32 }}>
        <article style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 20, background: '#fff' }}>
          <h2 style={{ marginTop: 0 }}>Runtime status</h2>
          <p style={{ marginBottom: 8 }}>
            Admin API: <strong>{data.adminApiUrl}</strong>
          </p>
          <p style={{ marginBottom: 0 }}>
            Health: <strong>{data.ok ? 'online' : 'offline'}</strong>
          </p>
          {data.error ? <p style={{ color: '#b91c1c', marginBottom: 0 }}>{data.error}</p> : null}
        </article>

        <article style={{ border: '1px solid #e5e7eb', borderRadius: 16, padding: 20, background: '#fff' }}>
          <h2 style={{ marginTop: 0 }}>Tenants</h2>
          {data.tenants.length === 0 ? (
            <p style={{ marginBottom: 0, lineHeight: 1.6 }}>No tenants yet. Create the first one from your admin flow.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.8 }}>
              {data.tenants.map((tenant) => (
                <li key={tenant.id}>
                  <strong>{tenant.name}</strong> <span style={{ opacity: 0.7 }}>({tenant.id})</span>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section style={{ marginTop: 32 }}>
        <h2>Runtime shape</h2>
        <pre
          style={{
            background: '#0f172a',
            color: '#e2e8f0',
            padding: 20,
            borderRadius: 16,
            overflowX: 'auto',
            lineHeight: 1.6
          }}
        >{`dashboard-web  ->  admin-api  ->  self-hosted Supabase
client apps    ->  SDK        ->  RLS-protected data`}</pre>
      </section>
    </main>
  );
}
