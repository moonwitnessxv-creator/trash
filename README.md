# trash

Independent multi-tenant platform scaffold.

## Stack
- `apps/dashboard-web`: Next.js + TypeScript control plane UI
- `apps/admin-api`: Fastify + TypeScript provisioning API
- `packages/sdk`: TypeScript SDK for client apps and the dashboard
- `db`: PostgreSQL schema and migrations
- `docker-compose.yml`: local runtime for Postgres, API, and dashboard

## What this repo is for
- One control plane for provisioning tenants, members, projects, and API keys
- Postgres-backed multi-tenant data model
- Dashboard for managing customer workspaces
- SDK wrapper for app/client usage

## Run it locally
1. Copy `.env.example` to `.env`
2. Install dependencies with `pnpm install`
3. Start the stack with `docker compose up`
4. Or run the app layer with `pnpm dev`

## Current flow
- Dashboard reads data from the control plane API
- Control plane API is protected with `ADMIN_API_KEY`
- Control plane API writes directly to PostgreSQL
- Client apps use the SDK wrapper
- PostgreSQL stores tenants, members, projects, keys, and audit logs

## Provisioning endpoints
- `POST /tenants`
- `GET /tenants`
- `GET /tenants/:tenantId/members`
- `POST /tenants/:tenantId/members`
- `GET /projects`
- `POST /projects`
- `GET /keys`
- `POST /keys`

## Next steps
- Add authentication for dashboard users
- Add billing and usage views
- Add automated backups and deployment manifests
