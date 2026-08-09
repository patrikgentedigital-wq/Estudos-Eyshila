-- Compatibility and safety migration for the React client.
-- This file is intentionally additive and must be applied in staging before production.

create table if not exists public.user_data (
  id uuid primary key references auth.users(id) on delete cascade,
  profile jsonb not null default '{}'::jsonb,
  modules jsonb not null default '[]'::jsonb,
  flashcards jsonb not null default '[]'::jsonb,
  attempts jsonb not null default '[]'::jsonb,
  question_exposures jsonb not null default '[]'::jsonb,
  questions_count integer not null default 0 check (questions_count >= 0),
  checklist jsonb not null default '[]'::jsonb,
  caderno_erros jsonb not null default '[]'::jsonb,
  roadmap jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- The legacy project may already have this table with only a subset of the
-- JSON columns. Keep the migration additive so the client can be upgraded
-- without requiring a destructive table replacement.
alter table public.user_data add column if not exists profile jsonb not null default '{}'::jsonb;
alter table public.user_data add column if not exists modules jsonb not null default '[]'::jsonb;
alter table public.user_data add column if not exists flashcards jsonb not null default '[]'::jsonb;
alter table public.user_data add column if not exists attempts jsonb not null default '[]'::jsonb;
alter table public.user_data add column if not exists question_exposures jsonb not null default '[]'::jsonb;
alter table public.user_data add column if not exists questions_count integer not null default 0;
alter table public.user_data add column if not exists checklist jsonb not null default '[]'::jsonb;
alter table public.user_data add column if not exists caderno_erros jsonb not null default '[]'::jsonb;
alter table public.user_data add column if not exists roadmap jsonb not null default '[]'::jsonb;
alter table public.user_data add column if not exists created_at timestamptz not null default now();
alter table public.user_data add column if not exists updated_at timestamptz not null default now();

alter table public.user_data enable row level security;

drop policy if exists "users_read_own_user_data" on public.user_data;
create policy "users_read_own_user_data" on public.user_data
  for select to authenticated using ((select auth.uid())::text = id::text);

drop policy if exists "users_insert_own_user_data" on public.user_data;
create policy "users_insert_own_user_data" on public.user_data
  for insert to authenticated with check ((select auth.uid())::text = id::text);

drop policy if exists "users_update_own_user_data" on public.user_data;
create policy "users_update_own_user_data" on public.user_data
  for update to authenticated
  using ((select auth.uid())::text = id::text)
  with check ((select auth.uid())::text = id::text);

drop policy if exists "users_delete_own_user_data" on public.user_data;
create policy "users_delete_own_user_data" on public.user_data
  for delete to authenticated using ((select auth.uid())::text = id::text);

revoke all on table public.user_data from anon;
grant select, insert, update, delete on table public.user_data to authenticated;
grant all on table public.user_data to service_role;

-- Answer keys must never be readable by browser roles, even if a future policy
-- is added accidentally to the table.
revoke all on table public.question_answer_keys from public, anon, authenticated;
grant all on table public.question_answer_keys to service_role;

create index if not exists user_data_updated_at_idx on public.user_data (updated_at desc);
create index if not exists exam_attempts_user_created_idx on public.exam_attempts (user_id, created_at desc);
create index if not exists question_review_states_user_question_idx on public.question_review_states (user_id, question_id);
create index if not exists question_options_question_position_idx on public.question_options (question_id, position);
create index if not exists questions_category_pool_status_idx on public.questions (category, pool, content_status)
  where is_active;
