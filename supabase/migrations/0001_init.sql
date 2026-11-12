create extension if not exists "pgcrypto";

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_members (
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id uuid not null,
  role text not null default 'member',
  created_at timestamptz not null default now(),
  primary key (tenant_id, user_id)
);

alter table public.tenants enable row level security;
alter table public.tenant_members enable row level security;

create policy "tenants are visible to members"
  on public.tenants
  for select
  using (
    exists (
      select 1
      from public.tenant_members tm
      where tm.tenant_id = tenants.id
        and tm.user_id = auth.uid()
    )
  );

create policy "members can read tenant members"
  on public.tenant_members
  for select
  using (
    exists (
      select 1
      from public.tenant_members tm
      where tm.tenant_id = tenant_members.tenant_id
        and tm.user_id = auth.uid()
    )
  );

create policy "service role can manage tenants"
  on public.tenants
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role can manage tenant members"
  on public.tenant_members
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
