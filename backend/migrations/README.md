# MCQ Supabase Migration

The migration is deliberately staged. MongoDB remains the default source of truth until the data copy and verification succeed.

## 1. Apply the schema

Run `001_mcq_supabase.sql` in the Supabase SQL editor. The MCQ tables have RLS enabled and do not expose browser policies. Backend writes must use `SUPABASE_SERVICE_ROLE_KEY`.

## 2. Configure backend-only variables

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=server-only-secret
MCQ_STORAGE_MODE=mongo
MCQ_COMPARE_READS=false
```

Never put `SUPABASE_SERVICE_ROLE_KEY` in the frontend `.env` or any `VITE_` variable.

## 3. Copy Mongo data

From `backend/src/mcq`:

```powershell
npm run migrate:supabase
```

The importer is idempotent through `legacy_mongo_id`, preserves Mongo relationships, and reports records that could not be mapped to an existing Supabase user.

## 4. Verify before switching traffic

```powershell
npm run verify:supabase
```

Verification compares Mongo counts and legacy-ID sets for tests, questions, answer keys, results, coding problems, submissions, violations, and OTPs.

## 5. Rollout order

1. Keep `MCQ_STORAGE_MODE=mongo` and run the importer.
2. Fix every reported missing mapping and rerun the importer.
3. Add dual-read comparisons for each controller endpoint.
4. Switch one read-only endpoint at a time to `MCQ_STORAGE_MODE=supabase`.
5. Enable Supabase writes only after read responses match Mongo in staging.
6. Back up MongoDB and retain it during a rollback window.
7. Remove Mongoose and Mongo startup only after production verification.