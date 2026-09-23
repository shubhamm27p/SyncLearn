-- ============================================================================
-- SyncLearn Security Audit & Remediation Migration
-- File: migrations/002_security_audit_remediation.sql
--
-- Objective:
-- 1. Resolve CRITICAL "rls_disabled_in_public" on all 5 core tables.
-- 2. Resolve CRITICAL "sensitive_columns_exposed" (protect users, media_permissions).
-- 3. Resolve "Unindexed foreign keys" on media_permissions, meetings, submissions.
-- 4. Preserve service_role administrative backend access.
-- ============================================================================

-- Ensure pgcrypto extension exists for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- STEP 1: Enable Row Level Security (RLS) on The 5 Core Tables
-- ----------------------------------------------------------------------------

ALTER TABLE public.media_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- STEP 2: Revoke Public API (anon / authenticated) Direct Table Access
-- Stops PostgREST from exposing private data via public endpoints
-- ----------------------------------------------------------------------------

REVOKE ALL ON TABLE public.media_permissions FROM anon, authenticated;
REVOKE ALL ON TABLE public.users FROM anon, authenticated;
REVOKE ALL ON TABLE public.meetings FROM anon, authenticated;
REVOKE ALL ON TABLE public.quizzes FROM anon, authenticated;
REVOKE ALL ON TABLE public.submissions FROM anon, authenticated;

-- Revoke default privileges on future tables and sequences
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;

-- ----------------------------------------------------------------------------
-- STEP 3: Grant Administrative Access to Backend service_role and postgres
-- Allows the Node.js backend using SUPABASE_SERVICE_ROLE_KEY to bypass RLS
-- ----------------------------------------------------------------------------

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role, postgres;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role, postgres;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO service_role, postgres;

-- ----------------------------------------------------------------------------
-- STEP 4: Resolve "Unindexed foreign keys" Warnings from Security Advisor
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_media_permissions_user_id ON public.media_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_quiz_id ON public.submissions(quiz_id);

-- ----------------------------------------------------------------------------
-- STEP 5: VERIFICATION QUERY
-- Shows the exact RLS status of all tables in the public schema
-- ----------------------------------------------------------------------------

SELECT
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
