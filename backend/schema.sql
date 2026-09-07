-- Supabase PostgreSQL Schema Migration

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    role VARCHAR(50) DEFAULT 'student',
    token VARCHAR(255),
    google_id VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE meetings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id VARCHAR(255) REFERENCES users(username),
    meeting_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quizzes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    meeting_id VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_option_index INTEGER NOT NULL,
    creator_id VARCHAR(255) DEFAULT 'Trainer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_id UUID REFERENCES quizzes(id),
    meeting_id VARCHAR(255) NOT NULL,
    student_username VARCHAR(255) NOT NULL,
    student_name VARCHAR(255),
    selected_option_index INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    score_earned INTEGER DEFAULT 0,
    latency_ms INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE media_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(255) NOT NULL,
    user_id UUID REFERENCES users(id),
    username VARCHAR(255),
    can_publish_audio BOOLEAN DEFAULT false,
    can_publish_video BOOLEAN DEFAULT false,
    can_screen_share BOOLEAN DEFAULT false,
    updated_by VARCHAR(255) DEFAULT 'Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, user_id)
);

CREATE TABLE site_settings (
    key VARCHAR(100) PRIMARY KEY,
    is_online BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO site_settings (key, is_online)
VALUES ('main_site', true)
ON CONFLICT (key) DO NOTHING;
