-- Integrity hardening for client persistence and exam state transitions.
-- This migration is additive and keeps answer keys server-only.

-- Exposure history is an append/update-by-server audit trail. A browser user
-- may read their own history for display, but must not reset or forge novelty.
drop policy if exists "users_insert_own_exposures" on public.question_exposures;
drop policy if exists "users_update_own_exposures" on public.question_exposures;
drop policy if exists "users_delete_own_exposures" on public.question_exposures;

revoke insert, update, delete, truncate, references, trigger
  on table public.question_exposures
  from authenticated;
grant select on table public.question_exposures to authenticated;

-- Merge only the fields supplied by the authenticated owner. This avoids a
-- full-row upsert from one tab erasing fields written by another tab/device.
create or replace function public.merge_user_data(p_data jsonb)
returns timestamptz
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  current_user_id uuid := (select auth.uid());
  saved_at timestamptz;
begin
  if current_user_id is null then
    raise exception 'AUTH_REQUIRED';
  end if;
  if p_data is null or pg_catalog.jsonb_typeof(p_data) <> 'object' then
    raise exception 'USER_DATA_PATCH_MUST_BE_OBJECT';
  end if;

  insert into public.user_data (id)
  values (current_user_id)
  on conflict (id) do nothing;

  update public.user_data
  set profile = case
      when p_data ? 'profile' and pg_catalog.jsonb_typeof(p_data->'profile') = 'object' then p_data->'profile'
      else profile
    end,
    modules = case
      when p_data ? 'modules' and pg_catalog.jsonb_typeof(p_data->'modules') = 'array' then p_data->'modules'
      else modules
    end,
    flashcards = case
      when p_data ? 'flashcards' and pg_catalog.jsonb_typeof(p_data->'flashcards') = 'array' then p_data->'flashcards'
      else flashcards
    end,
    attempts = case
      when p_data ? 'attempts' and pg_catalog.jsonb_typeof(p_data->'attempts') = 'array' then p_data->'attempts'
      else attempts
    end,
    question_exposures = case
      when p_data ? 'question_exposures' and pg_catalog.jsonb_typeof(p_data->'question_exposures') = 'array' then p_data->'question_exposures'
      else question_exposures
    end,
    questions_count = case
      when p_data ? 'questions_count'
        and (p_data->>'questions_count') ~ '^[0-9]+$'
        then (p_data->>'questions_count')::integer
      else questions_count
    end,
    checklist = case
      when p_data ? 'checklist' and pg_catalog.jsonb_typeof(p_data->'checklist') = 'array' then p_data->'checklist'
      else checklist
    end,
    caderno_erros = case
      when p_data ? 'caderno_erros' and pg_catalog.jsonb_typeof(p_data->'caderno_erros') = 'array' then p_data->'caderno_erros'
      else caderno_erros
    end,
    roadmap = case
      when p_data ? 'roadmap' and pg_catalog.jsonb_typeof(p_data->'roadmap') = 'array' then p_data->'roadmap'
      else roadmap
    end,
    updated_at = now()
  where public.user_data.id = current_user_id
  returning public.user_data.updated_at into saved_at;

  return saved_at;
end;
$function$;

revoke all on function public.merge_user_data(jsonb) from public, anon;
grant execute on function public.merge_user_data(jsonb) to authenticated;

-- Start a secure attempt, its item snapshot and its exposure history in one
-- transaction. Only the server's service role may invoke this function.
create or replace function public.create_exam_attempt_with_items(
  p_user_id uuid,
  p_blueprint_id text,
  p_mode text,
  p_total_questions smallint,
  p_novelty_rate numeric,
  p_valid_for_benchmark boolean,
  p_items jsonb
)
returns table (id uuid, started_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  attempt_id uuid;
  started_at_value timestamptz;
  inserted_items integer;
begin
  if p_user_id is null or p_blueprint_id is null or p_mode not in ('study', 'practice', 'benchmark') then
    raise exception 'INVALID_EXAM_ATTEMPT';
  end if;
  if p_total_questions is null or p_total_questions <= 0 then
    raise exception 'INVALID_EXAM_QUESTION_COUNT';
  end if;
  if p_items is null or pg_catalog.jsonb_typeof(p_items) <> 'array'
    or pg_catalog.jsonb_array_length(p_items) <> p_total_questions then
    raise exception 'EXAM_ITEMS_COUNT_MISMATCH';
  end if;

  insert into public.exam_attempts (
    user_id, blueprint_id, mode, total_questions, novelty_rate, valid_for_benchmark
  )
  values (
    p_user_id, p_blueprint_id, p_mode, p_total_questions, p_novelty_rate, p_valid_for_benchmark
  )
  returning public.exam_attempts.id, public.exam_attempts.started_at
  into attempt_id, started_at_value;

  insert into public.exam_attempt_items (
    attempt_id, user_id, question_id, question_version, position
  )
  select
    attempt_id,
    p_user_id,
    item.question_id,
    coalesce(item.question_version, '1'),
    item.position
  from pg_catalog.jsonb_to_recordset(p_items)
    as item(question_id text, question_version text, position smallint);
  get diagnostics inserted_items = row_count;
  if inserted_items <> p_total_questions then
    raise exception 'EXAM_ITEMS_INSERT_MISMATCH';
  end if;

  insert into public.question_exposures (user_id, question_id, attempt_id, mode)
  select p_user_id, item.question_id, attempt_id, p_mode
  from pg_catalog.jsonb_to_recordset(p_items)
    as item(question_id text, question_version text, position smallint);

  return query select attempt_id, started_at_value;
end;
$function$;

revoke all on function public.create_exam_attempt_with_items(uuid, text, text, smallint, numeric, boolean, jsonb)
  from public, anon, authenticated;
grant execute on function public.create_exam_attempt_with_items(uuid, text, text, smallint, numeric, boolean, jsonb)
  to service_role;

-- Complete an attempt exactly once and update its items/exposures atomically.
-- The row lock makes concurrent submit requests deterministic.
create or replace function public.submit_exam_attempt_atomic(
  p_user_id uuid,
  p_attempt_id uuid,
  p_submitted_at timestamptz,
  p_score numeric,
  p_answered_questions smallint,
  p_duration_seconds integer,
  p_novelty_rate numeric,
  p_valid_for_benchmark boolean,
  p_items jsonb,
  p_exposures jsonb
)
returns void
language plpgsql
security invoker
set search_path = ''
as $function$
declare
  attempt_row public.exam_attempts%rowtype;
  updated_items integer;
  updated_exposures integer;
begin
  select * into attempt_row
  from public.exam_attempts
  where public.exam_attempts.id = p_attempt_id
    and public.exam_attempts.user_id = p_user_id
  for update;

  if not found then
    raise exception 'ATTEMPT_NOT_FOUND';
  end if;
  if attempt_row.submitted_at is not null then
    raise exception 'ATTEMPT_ALREADY_SUBMITTED';
  end if;
  if p_items is null or pg_catalog.jsonb_typeof(p_items) <> 'array'
    or pg_catalog.jsonb_array_length(p_items) <> attempt_row.total_questions then
    raise exception 'EXAM_SUBMISSION_ITEMS_COUNT_MISMATCH';
  end if;
  if p_exposures is null or pg_catalog.jsonb_typeof(p_exposures) <> 'array'
    or pg_catalog.jsonb_array_length(p_exposures) <> attempt_row.total_questions then
    raise exception 'EXAM_SUBMISSION_EXPOSURES_COUNT_MISMATCH';
  end if;

  update public.exam_attempt_items as target
  set selected_position = item.selected_position,
      response_ms = item.response_ms,
      confidence = item.confidence,
      is_correct = item.is_correct,
      seen_externally = coalesce(item.seen_externally, false),
      answered_at = item.answered_at
  from pg_catalog.jsonb_to_recordset(p_items)
    as item(question_id text, selected_position smallint, response_ms integer, confidence smallint, is_correct boolean, seen_externally boolean, answered_at timestamptz)
  where target.attempt_id = p_attempt_id
    and target.user_id = p_user_id
    and target.question_id = item.question_id;
  get diagnostics updated_items = row_count;
  if updated_items <> attempt_row.total_questions then
    raise exception 'EXAM_SUBMISSION_ITEMS_UPDATE_MISMATCH';
  end if;

  update public.question_exposures as target
  set answered_at = exposure.answered_at,
      is_correct = exposure.is_correct,
      response_ms = exposure.response_ms,
      confidence = exposure.confidence,
      seen_externally = coalesce(exposure.seen_externally, false)
  from pg_catalog.jsonb_to_recordset(p_exposures)
    as exposure(question_id text, answered_at timestamptz, is_correct boolean, response_ms integer, confidence smallint, seen_externally boolean)
  where target.attempt_id = p_attempt_id
    and target.user_id = p_user_id
    and target.question_id = exposure.question_id;
  get diagnostics updated_exposures = row_count;
  if updated_exposures <> attempt_row.total_questions then
    raise exception 'EXAM_SUBMISSION_EXPOSURES_UPDATE_MISMATCH';
  end if;

  update public.exam_attempts
  set submitted_at = p_submitted_at,
      score = p_score,
      answered_questions = p_answered_questions,
      duration_seconds = p_duration_seconds,
      novelty_rate = p_novelty_rate,
      valid_for_benchmark = p_valid_for_benchmark
  where public.exam_attempts.id = p_attempt_id
    and public.exam_attempts.user_id = p_user_id
    and public.exam_attempts.submitted_at is null;
end;
$function$;

revoke all on function public.submit_exam_attempt_atomic(uuid, uuid, timestamptz, numeric, smallint, integer, numeric, boolean, jsonb, jsonb)
  from public, anon, authenticated;
grant execute on function public.submit_exam_attempt_atomic(uuid, uuid, timestamptz, numeric, smallint, integer, numeric, boolean, jsonb, jsonb)
  to service_role;
