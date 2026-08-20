import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const migration = readFileSync(new URL("../supabase/migrations/20260820120000_integrity_and_atomic_exam_flows.sql", import.meta.url), "utf8");

describe("integrity migration contract", () => {
  it("removes client writes to immutable exposure history", () => {
    expect(migration).toMatch(/drop policy if exists "users_insert_own_exposures"/i);
    expect(migration).toMatch(/drop policy if exists "users_update_own_exposures"/i);
    expect(migration).toMatch(/drop policy if exists "users_delete_own_exposures"/i);
    expect(migration).toMatch(/revoke insert, update, delete, truncate, references, trigger[\s\S]+question_exposures[\s\S]+authenticated/i);
  });

  it("defines restricted merge and atomic exam RPCs", () => {
    expect(migration).toMatch(/create or replace function public\.merge_user_data/i);
    expect(migration).toMatch(/create or replace function public\.create_exam_attempt_with_items/i);
    expect(migration).toMatch(/create or replace function public\.submit_exam_attempt_atomic/i);
    expect(migration).toMatch(/revoke all on function public\.create_exam_attempt_with_items/i);
    expect(migration).toMatch(/grant execute on function public\.submit_exam_attempt_atomic[^;]+service_role/i);
  });
});
