-- SyncLearn MCQ PostgreSQL migration.
-- Apply this in Supabase SQL Editor before enabling MCQ_USE_SUPABASE.
-- All MCQ writes are intended to use the backend service-role client.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.mcq_tests (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_mongo_id text UNIQUE,
    created_by uuid REFERENCES public.users(id) ON DELETE SET NULL,
    title varchar(200) NOT NULL,
    description varchar(1000) NOT NULL DEFAULT '',
    subject varchar(255) NOT NULL,
    test_type varchar(20) NOT NULL DEFAULT 'mcq' CHECK (test_type IN ('mcq', 'coding', 'combined')),
    coding_marks numeric NOT NULL DEFAULT 0,
    total_marks numeric NOT NULL DEFAULT 0,
    passing_marks numeric NOT NULL DEFAULT 0,
    duration integer NOT NULL CHECK (duration > 0),
    start_time timestamptz,
    end_time timestamptz,
    max_attempts integer NOT NULL DEFAULT 1 CHECK (max_attempts > 0),
    negative_marking boolean NOT NULL DEFAULT false,
    marks_per_question numeric NOT NULL DEFAULT 1,
    negative_marks numeric NOT NULL DEFAULT 0.25,
    passing_percentage numeric NOT NULL DEFAULT 40 CHECK (passing_percentage BETWEEN 0 AND 100),
    status varchar(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'active', 'completed', 'archived')),
    access_code text NOT NULL DEFAULT '',
    settings jsonb NOT NULL DEFAULT '{"shuffleQuestions":false,"shuffleOptions":false,"showResults":true,"allowReview":true,"autoSubmit":true}'::jsonb,
    tags jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.mcq_questions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id uuid NOT NULL REFERENCES public.mcq_tests(id) ON DELETE CASCADE,
    legacy_mongo_id text UNIQUE,
    question_no integer NOT NULL CHECK (question_no > 0),
    question_text text NOT NULL,
    option_a text NOT NULL,
    option_b text NOT NULL,
    option_c text NOT NULL,
    option_d text NOT NULL,
    option_e text NOT NULL DEFAULT '',
    marks numeric NOT NULL DEFAULT 1 CHECK (marks >= 0),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (test_id, question_no)
);

CREATE TABLE IF NOT EXISTS public.mcq_answer_keys (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    test_id uuid NOT NULL REFERENCES public.mcq_tests(id) ON DELETE CASCADE,
    legacy_mongo_id text UNIQUE,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (test_id)
);

CREATE TABLE IF NOT EXISTS public.mcq_answer_key_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    answer_key_id uuid NOT NULL REFERENCES public.mcq_answer_keys(id) ON DELETE CASCADE,
    question_no integer NOT NULL CHECK (question_no > 0),
    correct_option char(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D', 'E')),
    UNIQUE (answer_key_id, question_no)
);

CREATE TABLE IF NOT EXISTS public.mcq_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_mongo_id text UNIQUE,
    test_id uuid NOT NULL REFERENCES public.mcq_tests(id) ON DELETE CASCADE,
    student_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    score numeric NOT NULL DEFAULT 0,
    total_marks numeric NOT NULL DEFAULT 0,
    percentage numeric NOT NULL DEFAULT 0,
    correct_answers integer NOT NULL DEFAULT 0,
    incorrect_answers integer NOT NULL DEFAULT 0,
    unattempted integer NOT NULL DEFAULT 0,
    status varchar(20) NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'submitted', 'graded', 'reviewed')),
    auto_submitted boolean NOT NULL DEFAULT false,
    started_at timestamptz NOT NULL DEFAULT now(),
    submitted_at timestamptz,
    time_taken integer NOT NULL DEFAULT 0,
    attempt_number integer NOT NULL DEFAULT 1,
    ip_address inet,
    feedback text NOT NULL DEFAULT '',
    violations jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (test_id, student_id, attempt_number)
);

CREATE TABLE IF NOT EXISTS public.mcq_result_answers (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    result_id uuid NOT NULL REFERENCES public.mcq_results(id) ON DELETE CASCADE,
    question_no integer NOT NULL CHECK (question_no > 0),
    selected_option char(1) NOT NULL DEFAULT '' CHECK (selected_option IN ('', 'A', 'B', 'C', 'D', 'E')),
    UNIQUE (result_id, question_no)
);

CREATE TABLE IF NOT EXISTS public.coding_problems (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_mongo_id text UNIQUE,
    test_id uuid NOT NULL REFERENCES public.mcq_tests(id) ON DELETE CASCADE,
    problem_no integer NOT NULL CHECK (problem_no > 0),
    title varchar(200) NOT NULL,
    description text NOT NULL,
    input_format text NOT NULL DEFAULT '',
    output_format text NOT NULL DEFAULT '',
    constraints text NOT NULL DEFAULT '',
    sample_input text NOT NULL DEFAULT '',
    sample_output text NOT NULL DEFAULT '',
    total_marks numeric NOT NULL DEFAULT 10 CHECK (total_marks > 0),
    time_limit_ms integer NOT NULL DEFAULT 2000,
    memory_limit_kb integer NOT NULL DEFAULT 262144,
    allowed_languages jsonb NOT NULL DEFAULT '["c", "python", "java"]'::jsonb,
    difficulty varchar(20) NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE (test_id, problem_no)
);

CREATE TABLE IF NOT EXISTS public.coding_test_cases (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id uuid NOT NULL REFERENCES public.coding_problems(id) ON DELETE CASCADE,
    case_no integer NOT NULL CHECK (case_no >= 0),
    input text NOT NULL DEFAULT '',
    expected_output text NOT NULL,
    is_hidden boolean NOT NULL DEFAULT false,
    points numeric NOT NULL DEFAULT 1 CHECK (points >= 0),
    UNIQUE (problem_id, case_no)
);

CREATE TABLE IF NOT EXISTS public.coding_submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_mongo_id text UNIQUE,
    student_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    test_id uuid NOT NULL REFERENCES public.mcq_tests(id) ON DELETE CASCADE,
    problem_id uuid NOT NULL REFERENCES public.coding_problems(id) ON DELETE CASCADE,
    language varchar(20) NOT NULL CHECK (language IN ('c', 'python', 'java')),
    source_code text NOT NULL,
    score numeric NOT NULL DEFAULT 0,
    total_marks numeric NOT NULL DEFAULT 0,
    status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'error')),
    compilation_error text NOT NULL DEFAULT '',
    attempt_number integer NOT NULL DEFAULT 1,
    mcq_result_id uuid REFERENCES public.mcq_results(id) ON DELETE SET NULL,
    auto_submitted boolean NOT NULL DEFAULT false,
    violations jsonb NOT NULL DEFAULT '[]'::jsonb,
    submitted_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coding_test_case_results (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id uuid NOT NULL REFERENCES public.coding_submissions(id) ON DELETE CASCADE,
    case_no integer NOT NULL CHECK (case_no >= 0),
    passed boolean NOT NULL DEFAULT false,
    actual_output text NOT NULL DEFAULT '',
    execution_time numeric NOT NULL DEFAULT 0,
    memory_used numeric NOT NULL DEFAULT 0,
    status varchar(30) NOT NULL DEFAULT 'Pending',
    UNIQUE (submission_id, case_no)
);

CREATE TABLE IF NOT EXISTS public.violations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_mongo_id text UNIQUE,
    student_id uuid NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    test_id uuid NOT NULL REFERENCES public.mcq_tests(id) ON DELETE CASCADE,
    violation_type varchar(40) NOT NULL,
    description text NOT NULL DEFAULT '',
    occurred_at timestamptz NOT NULL DEFAULT now(),
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.otps (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    legacy_mongo_id text UNIQUE,
    email varchar(255) NOT NULL,
    otp_hash text NOT NULL,
    expires_at timestamptz NOT NULL,
    verified boolean NOT NULL DEFAULT false,
    attempts integer NOT NULL DEFAULT 0,
    created_at timestamptz NOT NULL DEFAULT now()
);

-- Keep the existing site_settings table compatible with both app surfaces.
CREATE TABLE IF NOT EXISTS public.site_settings (
    key varchar(100) PRIMARY KEY,
    is_online boolean NOT NULL DEFAULT true,
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_mcq_tests_status_start_time ON public.mcq_tests(status, start_time);
CREATE INDEX IF NOT EXISTS idx_mcq_tests_created_by_status ON public.mcq_tests(created_by, status);
CREATE INDEX IF NOT EXISTS idx_mcq_questions_test_question_no ON public.mcq_questions(test_id, question_no);
CREATE INDEX IF NOT EXISTS idx_mcq_results_student_submitted_at ON public.mcq_results(student_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_mcq_results_test_student ON public.mcq_results(test_id, student_id);
CREATE INDEX IF NOT EXISTS idx_mcq_results_test_score ON public.mcq_results(test_id, score DESC);
CREATE INDEX IF NOT EXISTS idx_coding_problems_test_problem_no ON public.coding_problems(test_id, problem_no);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_problem_student ON public.coding_submissions(problem_id, student_id);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_test_student_submitted_at ON public.coding_submissions(test_id, student_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_coding_submissions_student_submitted_at ON public.coding_submissions(student_id, submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_violations_test_student ON public.violations(test_id, student_id);
CREATE INDEX IF NOT EXISTS idx_otps_email_expires_at ON public.otps(email, expires_at DESC);
CREATE INDEX IF NOT EXISTS idx_users_token ON public.users(token);

-- Backend service-role requests bypass RLS. Browser clients cannot access MCQ tables.
ALTER TABLE public.mcq_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcq_answer_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcq_answer_key_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcq_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mcq_result_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_test_case_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.violations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otps ENABLE ROW LEVEL SECURITY;

INSERT INTO public.site_settings (key, is_online)
VALUES ('site', true)
ON CONFLICT (key) DO NOTHING;
