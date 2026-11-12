# trash

Monorepo scaffold for a Supabase-based multi-tenant SaaS platform.

## Stack
- `apps/dashboard-web`: Next.js + TypeScript
- `apps/admin-api`: Fastify + TypeScript
- `packages/sdk`: TypeScript SDK for client apps
- `supabase`: database schema and RLS policies
- `infra`: deployment and reverse proxy configs

## Goals
- One self-hosted Supabase deployment
- Multi-tenant data model using `tenant_id` + RLS
- Dashboard for provisioning tenants, projects, and API keys
- SDK wrapper for app/client usage

## Next steps
1. Install dependencies
2. Wire the dashboard to the admin API
3. Add auth + tenant provisioning flows
4. Add RLS policies for every exposed table
