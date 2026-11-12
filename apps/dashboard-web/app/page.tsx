export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: 'system-ui, sans-serif' }}>
      <h1>Trash Dashboard</h1>
      <p>Multi-tenant control plane for a self-hosted Supabase stack.</p>
      <ul>
        <li>Create tenants</li>
        <li>Invite members</li>
        <li>Manage projects and keys</li>
        <li>View usage and audit logs</li>
      </ul>
    </main>
  );
}
