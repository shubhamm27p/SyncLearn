-- SyncLearn core Supabase PostgreSQL schema.
-- Run this before 001_mcq_supabase.sql in the Supabase SQL editor.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name varchar(255) NOT NULL,
    username varchar(255) UNIQUE NOT NULL,
    email varchar(255) UNIQUE,
    password varchar(255),
    role varchar(50) NOT NULL DEFAULT 'student',
    token varchar(255),
    google_id varchar(255),
    is_active boolean NOT NULL DEFAULT true,
    reset_password_token varchar(255),
    reset_password_expires timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.meetings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id varchar(255) REFERENCES public.users(username),
    meeting_id varchar(255) NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.quizzes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    meeting_id varchar(255) NOT NULL,
    question text NOT NULL,
    options jsonb NOT NULL,
    correct_option_index integer NOT NULL,
    creator_id varchar(255) NOT NULL DEFAULT 'Trainer',
    created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.submissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id uuid REFERENCES public.quizzes(id) ON DELETE CASCADE,
    meeting_id varchar(255) NOT NULL,
    student_username varchar(255) NOT NULL,
    student_name varchar(255),
    selected_option_index integer NOT NULL,
    is_correct boolean NOT NULL,
    score_earned integer NOT NULL DEFAULT 0,
    latency_ms integer NOT NULL DEFAULT 0,
    submitted_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.media_permissions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id varchar(255) NOT NULL,
    user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
    username varchar(255),
    can_publish_audio boolean NOT NULL DEFAULT false,
    can_publish_video boolean NOT NULL DEFAULT false,
    can_screen_share boolean NOT NULL DEFAULT false,
    updated_by varchar(255) NOT NULL DEFAULT 'Admin',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    UNIQUE(session_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.site_settings (
    key varchar(100) PRIMARY KEY,
    is_online boolean NOT NULL DEFAULT true,
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_users_token ON public.users(token);
CREATE INDEX IF NOT EXISTS idx_meetings_meeting_id ON public.meetings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_meeting_id ON public.quizzes(meeting_id);
CREATE INDEX IF NOT EXISTS idx_submissions_quiz_id ON public.submissions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_submissions_meeting_id ON public.submissions(meeting_id);

INSERT INTO public.site_settings (key, is_online)
VALUES ('main_site', true)
ON CONFLICT (key) DO NOTHING;
