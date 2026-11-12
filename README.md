# trash

Monorepo scaffold for a Supabase-based multi-tenant SaaS platform.

## Stack
- `apps/dashboard-web`: Next.js + TypeScript control plane
- `apps/admin-api`: Fastify + TypeScript provisioning API
- `packages/sdk`: TypeScript SDK for client apps and the dashboard
- `supabase`: database schema and RLS policies
- `docker-compose.yml`: local app runtime for dashboard + API

## What this repo is for
- One self-hosted Supabase deployment
- Multi-tenant data model using `tenant_id` + RLS
- Dashboard for provisioning tenants, members, and keys
- SDK wrapper for app/client usage

## Run it locally
1. Copy `.env.example` to `.env`
2. Fill in your Supabase URL and keys
3. Install dependencies with `pnpm install`
4. Start the app layer with `pnpm dev`

You can also use Docker Compose:

```bash
docker compose up
```

## Current flow
- Dashboard reads data from the admin API
- Admin API writes to Supabase using the service role key
- Client apps use the SDK wrapper
- Supabase enforces access with RLS

## Next steps
- Connect authentication and tenant invitations
- Add project and key provisioning endpoints
- Add usage and audit views in the dashboard
