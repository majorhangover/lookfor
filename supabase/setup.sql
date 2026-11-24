-- Lookfor database setup. Paste this into Supabase: SQL Editor > New query > Run.

create table if not exists public.accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  people jsonb not null default '[]'::jsonb,
  marketing_opt_in boolean not null default false,
  marketing_opt_in_at timestamptz,
  region text check (region in ('UK', 'US')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.accounts enable row level security;
grant select, insert, update, delete on public.accounts to authenticated;

-- Each signed-in user can only see and change their own row.
drop policy if exists "own row select" on public.accounts;
drop policy if exists "own row insert" on public.accounts;
drop policy if exists "own row update" on public.accounts;
drop policy if exists "own row delete" on public.accounts;
create policy "own row select" on public.accounts for select to authenticated using ((select auth.uid()) = user_id);
create policy "own row insert" on public.accounts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own row update" on public.accounts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "own row delete" on public.accounts for delete to authenticated using ((select auth.uid()) = user_id);

-- Lets a user delete their own account (and, by cascade, their saved list).
create or replace function public.delete_my_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
