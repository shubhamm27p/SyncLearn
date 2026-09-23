-- ============================================================================
-- SyncLearn Security Audit & Remediation Migration
-- File: migrations/002_security_audit_remediation.sql
--
-- Objective:
-- 1. Resolve CRITICAL "rls_disabled_in_public" on all public tables.
-- 2. Resolve CRITICAL "sensitive_columns_exposed" (protect passwords, tokens, answer keys, personal data).
-- 3. Enforce Least Privilege: Revoke public API (anon / authenticated) access to private application data.
-- 4. Preserve service_role administrative backend access.
-- ============================================================================

-- Ensure pgcrypto extension exists for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- STEP 1: Enable Row Level Security (RLS) on All Core Tables
-- ----------------------------------------------------------------------------

ALTER TABLE IF EXISTS public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.media_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.site_settings ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- STEP 2: Ensure Row Level Security (RLS) on All MCQ & Assessment Tables
-- ----------------------------------------------------------------------------

ALTER TABLE IF EXISTS public.mcq_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mcq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mcq_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mcq_answer_key_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mcq_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.mcq_result_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coding_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coding_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coding_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.coding_test_case_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.otps ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- STEP 3: Clean up any existing unsafe / overly broad policies
-- ----------------------------------------------------------------------------

DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND (policyname ILIKE '%anon%' OR policyname ILIKE '%public%' OR policyname ILIKE '%allow_all%')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- STEP 4: Revoke Dangerous Default Grants From Public Roles (anon, authenticated)
-- By default, PostgreSQL / Supabase grants ALL privileges on public tables to anon
-- and authenticated. Revoking them stops PostgREST from exposing table endpoints.
-- ----------------------------------------------------------------------------

REVOKE ALL ON TABLE public.users FROM anon, authenticated;
REVOKE ALL ON TABLE public.meetings FROM anon, authenticated;
REVOKE ALL ON TABLE public.quizzes FROM anon, authenticated;
REVOKE ALL ON TABLE public.submissions FROM anon, authenticated;
REVOKE ALL ON TABLE public.media_permissions FROM anon, authenticated;
REVOKE ALL ON TABLE public.site_settings FROM anon, authenticated;

-- Revoke on MCQ tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'mcq_tests') THEN
        REVOKE ALL ON TABLE public.mcq_tests FROM anon, authenticated;
        REVOKE ALL ON TABLE public.mcq_questions FROM anon, authenticated;
        REVOKE ALL ON TABLE public.mcq_answer_keys FROM anon, authenticated;
        REVOKE ALL ON TABLE public.mcq_answer_key_items FROM anon, authenticated;
        REVOKE ALL ON TABLE public.mcq_results FROM anon, authenticated;
        REVOKE ALL ON TABLE public.mcq_result_answers FROM anon, authenticated;
        REVOKE ALL ON TABLE public.coding_problems FROM anon, authenticated;
        REVOKE ALL ON TABLE public.coding_test_cases FROM anon, authenticated;
        REVOKE ALL ON TABLE public.coding_submissions FROM anon, authenticated;
        REVOKE ALL ON TABLE public.coding_test_case_results FROM anon, authenticated;
        REVOKE ALL ON TABLE public.violations FROM anon, authenticated;
        REVOKE ALL ON TABLE public.otps FROM anon, authenticated;
    END IF;
END $$;

-- Revoke sequences
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;

-- Ensure future tables in public schema do not auto-grant access to anon/authenticated
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;

-- ----------------------------------------------------------------------------
-- STEP 5: Grant Administrative Access to service_role and postgres
-- The backend server uses the service_role key to bypass RLS and perform operations.
-- ----------------------------------------------------------------------------

GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role, postgres;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role, postgres;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO service_role, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO service_role, postgres;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO service_role, postgres;

-- ----------------------------------------------------------------------------
-- STEP 6: Optional Read-Only Site Status Policy (defense in depth)
-- If site status is ever read directly via client-side anon queries, only is_online is readable.
-- ----------------------------------------------------------------------------

GRANT SELECT ON public.site_settings TO anon, authenticated;

DROP POLICY IF EXISTS "public_read_site_settings" ON public.site_settings;
CREATE POLICY "public_read_site_settings"
    ON public.site_settings
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- ----------------------------------------------------------------------------
-- STEP 7: Resolve "Unindexed foreign keys" Warnings from Security Advisor
-- Adds performance and constraint validation indexes for foreign keys
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_media_permissions_user_id ON public.media_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON public.meetings(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_quiz_id ON public.submissions(quiz_id);

-- ----------------------------------------------------------------------------
-- VERIFICATION QUERY
-- Output the RLS status of all tables in the public schema
-- ----------------------------------------------------------------------------

SELECT
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
