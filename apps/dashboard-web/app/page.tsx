export default function HomePage() {
  return (
    <main style={{ padding: 32, fontFamily: 'system-ui, sans-serif', maxWidth: 960, margin: '0 auto' }}>
      <header style={{ marginBottom: 32 }}>
        <p style={{ textTransform: 'uppercase', letterSpacing: 1.2, fontSize: 12, opacity: 0.7 }}>
          Trash Control Plane
        </p>
        <h1 style={{ fontSize: 40, margin: '8px 0' }}>Multi-tenant Supabase platform</h1>
        <p style={{ fontSize: 18, lineHeight: 1.6, maxWidth: 720 }}>
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
