-- Learning-integrity foundation for Estudos Eyshila.
-- Content and answer keys are separated so authenticated browser clients never
-- receive the correct option before an attempt is submitted.

create table if not exists public.exam_blueprints (
  id text primary key,
  name text not null,
  board text not null,
  cycle text not null,
  question_count smallint not null check (question_count > 0),
  duration_minutes smallint not null check (duration_minutes > 0),
  options_per_question smallint not null check (options_per_question between 2 and 10),
  general_question_count smallint not null check (general_question_count >= 0),
  specific_question_count smallint not null check (specific_question_count >= 0),
  minimum_passing_percentage numeric(5,2) not null check (minimum_passing_percentage between 0 and 100),
  allow_back_navigation boolean not null default true,
  allow_pause boolean not null default false,
  feedback_policy text not null check (feedback_policy in ('immediate', 'after_submission')),
  source_url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint exam_blueprints_composition_check
    check (question_count = general_question_count + specific_question_count)
);

create table if not exists public.competencies (
  id text primary key,
  blueprint_id text not null references public.exam_blueprints(id) on delete cascade,
  name text not null,
  scope text not null check (scope in ('general', 'specific')),
  syllabus_weight numeric(6,5) not null check (syllabus_weight > 0 and syllabus_weight <= 1),
  created_at timestamptz not null default now()
);

create table if not exists public.clinical_cases (
  id uuid primary key default gen_random_uuid(),
  title text,
  setting text,
  age_group text,
  presenting_problem text,
  history text,
  physical_exam text,
  vitals jsonb not null default '{}'::jsonb check (jsonb_typeof(vitals) = 'object'),
  labs jsonb not null default '{}'::jsonb check (jsonb_typeof(labs) = 'object'),
  timeline jsonb not null default '[]'::jsonb check (jsonb_typeof(timeline) = 'array'),
  source text,
  content_version text,
  content_status text not null default 'draft' check (content_status in ('draft', 'reviewed', 'published')),
  reviewed_by text,
  reviewed_at timestamptz,
  source_review_due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.questions (
  id text primary key,
  clinical_case_id uuid references public.clinical_cases(id) on delete set null,
  primary_competency_id text references public.competencies(id) on delete set null,
  stem text not null,
  lead_in text,
  category text not null,
  scope text not null check (scope in ('general', 'specific')),
  cognitive_type text not null check (cognitive_type in ('factual', 'protocol', 'clinical_reasoning')),
  criticality smallint not null default 1 check (criticality between 1 and 3),
  pool text not null check (pool in ('study', 'assessment', 'calibration')),
  authored_difficulty smallint not null default 2 check (authored_difficulty between 1 and 3),
  family_id text,
  content_version text not null default '1',
  content_hash text,
  source text,
  source_review_due_at timestamptz,
  content_status text not null default 'draft' check (content_status in ('draft', 'reviewed', 'published')),
  reviewed_by text,
  reviewed_at timestamptz,
  sampling_key double precision not null default random(),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.question_options (
  id bigint generated always as identity primary key,
  question_id text not null references public.questions(id) on delete cascade,
  position smallint not null check (position between 0 and 9),
  option_text text not null,
  created_at timestamptz not null default now(),
  unique (question_id, position)
);

create table if not exists public.question_answer_keys (
  question_id text primary key references public.questions(id) on delete cascade,
  correct_position smallint not null check (correct_position between 0 and 9),
  explanation text not null,
  pivotal_cues text[] not null default '{}',
  reasoning_steps text[] not null default '{}',
  distractor_explanations jsonb not null default '[]'::jsonb check (jsonb_typeof(distractor_explanations) = 'array'),
  updated_at timestamptz not null default now(),
  constraint question_answer_keys_option_fk
    foreign key (question_id, correct_position)
    references public.question_options(question_id, position)
    on delete no action
    deferrable initially deferred
);

create table if not exists public.question_competencies (
  question_id text not null references public.questions(id) on delete cascade,
  competency_id text not null references public.competencies(id) on delete cascade,
  relevance_weight numeric(4,3) not null default 1 check (relevance_weight > 0 and relevance_weight <= 1),
  primary key (question_id, competency_id)
);

create table if not exists public.exam_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  blueprint_id text references public.exam_blueprints(id) on delete set null,
  mode text not null check (mode in ('study', 'practice', 'benchmark')),
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score numeric(5,2) check (score between 0 and 100),
  total_questions smallint not null check (total_questions > 0),
  answered_questions smallint not null default 0 check (answered_questions >= 0),
  duration_seconds integer check (duration_seconds >= 0),
  novelty_rate numeric(5,2) check (novelty_rate between 0 and 100),
  valid_for_benchmark boolean not null default false,
  created_at timestamptz not null default now(),
  unique (id, user_id),
  constraint exam_attempts_answered_check check (answered_questions <= total_questions)
);

create table if not exists public.exam_attempt_items (
  attempt_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references public.questions(id) on delete restrict,
  question_version text not null,
  position smallint not null check (position >= 0),
  selected_position smallint check (selected_position between 0 and 9),
  response_ms integer check (response_ms >= 0),
  confidence smallint check (confidence between 1 and 3),
  is_correct boolean,
  seen_externally boolean not null default false,
  answered_at timestamptz,
  primary key (attempt_id, position),
  unique (attempt_id, question_id),
  foreign key (attempt_id, user_id) references public.exam_attempts(id, user_id) on delete cascade
);

create table if not exists public.question_exposures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references public.questions(id) on delete cascade,
  attempt_id uuid,
  mode text not null check (mode in ('study', 'practice', 'benchmark', 'daily', 'errors')),
  shown_at timestamptz not null default now(),
  answered_at timestamptz,
  is_correct boolean,
  response_ms integer check (response_ms >= 0),
  confidence smallint check (confidence between 1 and 3),
  seen_externally boolean not null default false,
  foreign key (attempt_id, user_id) references public.exam_attempts(id, user_id) on delete cascade
);

create table if not exists public.question_review_states (
  user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references public.questions(id) on delete cascade,
  repetitions integer not null default 0 check (repetitions >= 0),
  interval_days integer not null default 0 check (interval_days >= 0),
  ease_factor numeric(4,2) not null default 2.50 check (ease_factor >= 1.30),
  lapses integer not null default 0 check (lapses >= 0),
  last_quality smallint check (last_quality between 0 and 5),
  due_at timestamptz,
  competency_due_at timestamptz,
  last_reviewed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, question_id)
);

create or replace function public.validate_published_question()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  option_count integer;
  answer_key public.question_answer_keys%rowtype;
begin
  if new.content_status <> 'published' then
    return new;
  end if;

  if nullif(btrim(new.source), '') is null then
    raise exception 'Published questions require a traceable source.';
  end if;
  if nullif(btrim(new.reviewed_by), '') is null or new.reviewed_at is null then
    raise exception 'Published questions require reviewer identity and review timestamp.';
  end if;
  if new.pool = 'assessment' and nullif(btrim(new.family_id), '') is null then
    raise exception 'Assessment questions require a family_id for contamination control.';
  end if;
  if new.cognitive_type = 'clinical_reasoning' and new.clinical_case_id is null then
    raise exception 'Published clinical-reasoning questions require a structured clinical case.';
  end if;
  if new.clinical_case_id is not null and not exists (
    select 1
    from public.clinical_cases clinical_case
    where clinical_case.id = new.clinical_case_id
      and clinical_case.content_status = 'published'
  ) then
    raise exception 'The linked clinical case must be published first.';
  end if;

  select count(*) into option_count
  from public.question_options question_option
  where question_option.question_id = new.id;
  if option_count <> 5 then
    raise exception 'Published ENARE questions require exactly five options.';
  end if;

  select * into answer_key
  from public.question_answer_keys stored_key
  where stored_key.question_id = new.id;
  if not found then
    raise exception 'Published questions require a private answer key.';
  end if;
  if jsonb_array_length(answer_key.distractor_explanations) <> option_count then
    raise exception 'Each option requires a distractor explanation entry.';
  end if;
  if new.cognitive_type = 'clinical_reasoning'
    and (cardinality(answer_key.pivotal_cues) = 0 or cardinality(answer_key.reasoning_steps) = 0) then
    raise exception 'Clinical-reasoning questions require pivotal cues and reasoning steps.';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_published_question() from public, anon, authenticated;
grant execute on function public.validate_published_question() to service_role;

drop trigger if exists questions_validate_before_publish on public.questions;
create trigger questions_validate_before_publish
before insert or update on public.questions
for each row execute function public.validate_published_question();

create or replace function public.prevent_published_question_component_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  affected_question_id text;
begin
  affected_question_id := case when tg_op = 'DELETE' then old.question_id else new.question_id end;
  if exists (
    select 1 from public.questions protected_question
    where protected_question.id = affected_question_id
      and protected_question.content_status = 'published'
  ) then
    raise exception 'Set the question back to draft before changing options or answer keys.';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function public.prevent_published_question_component_mutation() from public, anon, authenticated;
grant execute on function public.prevent_published_question_component_mutation() to service_role;

drop trigger if exists question_options_protect_published on public.question_options;
create trigger question_options_protect_published
before insert or update or delete on public.question_options
for each row execute function public.prevent_published_question_component_mutation();

drop trigger if exists question_answer_keys_protect_published on public.question_answer_keys;
create trigger question_answer_keys_protect_published
before insert or update or delete on public.question_answer_keys
for each row execute function public.prevent_published_question_component_mutation();

create or replace function public.prevent_published_clinical_case_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.content_status = 'published' then
    if tg_op = 'DELETE' and exists (
      select 1 from public.questions linked_question
      where linked_question.clinical_case_id = old.id
        and linked_question.content_status = 'published'
    ) then
      raise exception 'Set linked questions back to draft before deleting a published clinical case.';
    end if;
    if tg_op = 'UPDATE'
      and new.content_status = 'published'
      and to_jsonb(new) is distinct from to_jsonb(old) then
      raise exception 'Set the clinical case back to draft before editing published content.';
    end if;
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

revoke all on function public.prevent_published_clinical_case_mutation() from public, anon, authenticated;
grant execute on function public.prevent_published_clinical_case_mutation() to service_role;

drop trigger if exists clinical_cases_protect_published on public.clinical_cases;
create trigger clinical_cases_protect_published
before update or delete on public.clinical_cases
for each row execute function public.prevent_published_clinical_case_mutation();

-- Compatibility column while the React client dual-writes its legacy user_data row.
alter table if exists public.user_data
  add column if not exists question_exposures jsonb not null default '[]'::jsonb;

-- Rebuild legacy user_data policies defensively. The client stores one row per
-- authenticated user, so no browser session may read or mutate another row.
do $$
declare
  existing_policy record;
begin
  if to_regclass('public.user_data') is not null then
    execute 'alter table public.user_data enable row level security';
    for existing_policy in
      select policyname
      from pg_policies
      where schemaname = 'public' and tablename = 'user_data'
    loop
      execute format('drop policy %I on public.user_data', existing_policy.policyname);
    end loop;
    execute 'create policy "users_read_own_legacy_data" on public.user_data for select to authenticated using ((select auth.uid())::text = id::text)';
    execute 'create policy "users_insert_own_legacy_data" on public.user_data for insert to authenticated with check ((select auth.uid())::text = id::text)';
    execute 'create policy "users_update_own_legacy_data" on public.user_data for update to authenticated using ((select auth.uid())::text = id::text) with check ((select auth.uid())::text = id::text)';
    execute 'create policy "users_delete_own_legacy_data" on public.user_data for delete to authenticated using ((select auth.uid())::text = id::text)';
    execute 'revoke all on table public.user_data from anon';
    execute 'grant select, insert, update, delete on table public.user_data to authenticated';
  end if;
end;
$$;

create index if not exists competencies_blueprint_id_idx on public.competencies (blueprint_id);
create index if not exists questions_clinical_case_id_idx on public.questions (clinical_case_id);
create index if not exists questions_primary_competency_id_idx on public.questions (primary_competency_id);
create index if not exists questions_pool_scope_sampling_idx
  on public.questions (pool, scope, sampling_key)
  where is_active and content_status = 'published';
create unique index if not exists questions_content_hash_unique_idx
  on public.questions (content_hash)
  where content_hash is not null;
create index if not exists question_options_question_id_idx on public.question_options (question_id);
create index if not exists question_competencies_competency_id_idx on public.question_competencies (competency_id);
create index if not exists exam_attempts_user_started_idx on public.exam_attempts (user_id, started_at desc);
create index if not exists exam_attempts_open_idx on public.exam_attempts (user_id, started_at desc) where submitted_at is null;
create index if not exists exam_attempt_items_user_attempt_idx on public.exam_attempt_items (user_id, attempt_id);
create index if not exists exam_attempt_items_question_id_idx on public.exam_attempt_items (question_id);
create index if not exists question_exposures_user_question_shown_idx on public.question_exposures (user_id, question_id, shown_at desc);
create index if not exists question_exposures_attempt_id_idx on public.question_exposures (attempt_id) where attempt_id is not null;
create index if not exists question_review_states_due_idx on public.question_review_states (user_id, due_at) where due_at is not null;
create index if not exists question_review_states_competency_due_idx on public.question_review_states (user_id, competency_due_at) where competency_due_at is not null;

alter table public.exam_blueprints enable row level security;
alter table public.competencies enable row level security;
alter table public.clinical_cases enable row level security;
alter table public.questions enable row level security;
alter table public.question_options enable row level security;
alter table public.question_answer_keys enable row level security;
alter table public.question_competencies enable row level security;
alter table public.exam_attempts enable row level security;
alter table public.exam_attempt_items enable row level security;
alter table public.question_exposures enable row level security;
alter table public.question_review_states enable row level security;

drop policy if exists "authenticated_read_active_blueprints" on public.exam_blueprints;
create policy "authenticated_read_active_blueprints" on public.exam_blueprints
  for select to authenticated using (is_active);

drop policy if exists "authenticated_read_competencies" on public.competencies;
create policy "authenticated_read_competencies" on public.competencies
  for select to authenticated using (true);

drop policy if exists "authenticated_read_published_cases" on public.clinical_cases;
create policy "authenticated_read_published_cases" on public.clinical_cases
  for select to authenticated using (
    content_status = 'published'
    and exists (
      select 1 from public.questions visible_question
      where visible_question.clinical_case_id = clinical_cases.id
        and visible_question.pool <> 'assessment'
        and visible_question.is_active
        and visible_question.content_status = 'published'
    )
  );

drop policy if exists "authenticated_read_published_questions" on public.questions;
create policy "authenticated_read_published_questions" on public.questions
  for select to authenticated using (
    pool <> 'assessment'
    and is_active
    and content_status = 'published'
  );

drop policy if exists "authenticated_read_question_options" on public.question_options;
create policy "authenticated_read_question_options" on public.question_options
  for select to authenticated using (
    exists (
      select 1 from public.questions q
      where q.id = question_options.question_id
        and q.pool <> 'assessment'
        and q.is_active
        and q.content_status = 'published'
    )
  );

drop policy if exists "authenticated_read_question_competencies" on public.question_competencies;
create policy "authenticated_read_question_competencies" on public.question_competencies
  for select to authenticated using (
    exists (
      select 1 from public.questions visible_question
      where visible_question.id = question_competencies.question_id
        and visible_question.pool <> 'assessment'
        and visible_question.is_active
        and visible_question.content_status = 'published'
    )
  );

drop policy if exists "users_read_own_attempts" on public.exam_attempts;
create policy "users_read_own_attempts" on public.exam_attempts
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "users_insert_own_attempts" on public.exam_attempts;
drop policy if exists "users_update_own_attempts" on public.exam_attempts;
drop policy if exists "users_delete_own_attempts" on public.exam_attempts;

drop policy if exists "users_read_own_attempt_items" on public.exam_attempt_items;
create policy "users_read_own_attempt_items" on public.exam_attempt_items
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "users_insert_own_attempt_items" on public.exam_attempt_items;
drop policy if exists "users_update_own_attempt_items" on public.exam_attempt_items;
drop policy if exists "users_delete_own_attempt_items" on public.exam_attempt_items;

drop policy if exists "users_read_own_exposures" on public.question_exposures;
create policy "users_read_own_exposures" on public.question_exposures
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "users_insert_own_exposures" on public.question_exposures;
create policy "users_insert_own_exposures" on public.question_exposures
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "users_update_own_exposures" on public.question_exposures;
create policy "users_update_own_exposures" on public.question_exposures
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "users_delete_own_exposures" on public.question_exposures;
create policy "users_delete_own_exposures" on public.question_exposures
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "users_read_own_review_states" on public.question_review_states;
create policy "users_read_own_review_states" on public.question_review_states
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "users_insert_own_review_states" on public.question_review_states;
create policy "users_insert_own_review_states" on public.question_review_states
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "users_update_own_review_states" on public.question_review_states;
create policy "users_update_own_review_states" on public.question_review_states
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "users_delete_own_review_states" on public.question_review_states;
create policy "users_delete_own_review_states" on public.question_review_states
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Explicit Data API grants are required by the 2026 Supabase defaults.
revoke all on table public.exam_blueprints, public.competencies, public.clinical_cases,
  public.questions, public.question_options, public.question_answer_keys,
  public.question_competencies, public.exam_attempts, public.exam_attempt_items,
  public.question_exposures, public.question_review_states from anon;

grant select on table public.exam_blueprints, public.competencies, public.clinical_cases,
  public.questions, public.question_options, public.question_competencies to authenticated;
grant select on table public.exam_attempts, public.exam_attempt_items to authenticated;
grant select, insert, update, delete on table public.question_exposures,
  public.question_review_states to authenticated;

revoke all on table public.question_answer_keys from authenticated;
revoke insert, update, delete, truncate, references, trigger
  on table public.exam_attempts, public.exam_attempt_items
  from authenticated;
grant all on table public.exam_blueprints, public.competencies, public.clinical_cases,
  public.questions, public.question_options, public.question_answer_keys,
  public.question_competencies, public.exam_attempts, public.exam_attempt_items,
  public.question_exposures, public.question_review_states to service_role;
grant usage, select on sequence public.question_options_id_seq to service_role;

insert into public.exam_blueprints (
  id, name, board, cycle, question_count, duration_minutes, options_per_question,
  general_question_count, specific_question_count, minimum_passing_percentage, allow_back_navigation,
  allow_pause, feedback_policy, source_url
) values (
  'enare-2026-area-profissional',
  'ENARE 2026/2027 - Enfermagem',
  'FGV',
  '2026/2027',
  100,
  300,
  5,
  20,
  80,
  50,
  true,
  false,
  'after_submission',
  'https://enare2026.conhecimento.fgv.br/docs/36fa57ca8c68805fad82fce1d233592a.pdf'
) on conflict (id) do update set
  name = excluded.name,
  board = excluded.board,
  cycle = excluded.cycle,
  question_count = excluded.question_count,
  duration_minutes = excluded.duration_minutes,
  options_per_question = excluded.options_per_question,
  general_question_count = excluded.general_question_count,
  specific_question_count = excluded.specific_question_count,
  minimum_passing_percentage = excluded.minimum_passing_percentage,
  allow_back_navigation = excluded.allow_back_navigation,
  allow_pause = excluded.allow_pause,
  feedback_policy = excluded.feedback_policy,
  source_url = excluded.source_url,
  updated_at = now();

insert into public.competencies (id, blueprint_id, name, scope, syllabus_weight)
values
  ('enare-general', 'enare-2026-area-profissional', 'Competências gerais das profissões de saúde', 'general', 0.20),
  ('enare-nursing-specific', 'enare-2026-area-profissional', 'Competências específicas de Enfermagem', 'specific', 0.80)
on conflict (id) do update set
  blueprint_id = excluded.blueprint_id,
  name = excluded.name,
  scope = excluded.scope,
  syllabus_weight = excluded.syllabus_weight;
