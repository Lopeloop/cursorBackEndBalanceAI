-- Supabase Schema for Ember Balance AI (Fixed Version)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Answers table
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    value INTEGER NOT NULL CHECK (value >= 1 AND value <= 10),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    summary TEXT NOT NULL,
    wheel_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Focus sessions table
CREATE TABLE IF NOT EXISTS focus_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    updated_wheel JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_session_id ON users(session_id);
CREATE INDEX IF NOT EXISTS idx_answers_user_id ON answers(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_category ON answers(category);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_user_id ON focus_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_focus_sessions_category ON focus_sessions(category);

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE focus_sessions ENABLE ROW LEVEL SECURITY;

-- Users policies (using IF NOT EXISTS)
CREATE POLICY IF NOT EXISTS "Users can view their own data" ON users
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (true);

-- Answers policies (using IF NOT EXISTS)
CREATE POLICY IF NOT EXISTS "Users can view their own answers" ON answers
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert their own answers" ON answers
    FOR INSERT WITH CHECK (true);

-- Reports policies (using IF NOT EXISTS)
CREATE POLICY IF NOT EXISTS "Users can view their own reports" ON reports
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert their own reports" ON reports
    FOR INSERT WITH CHECK (true);

-- Focus sessions policies (using IF NOT EXISTS)
CREATE POLICY IF NOT EXISTS "Users can view their own focus sessions" ON focus_sessions
    FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Users can insert their own focus sessions" ON focus_sessions
    FOR INSERT WITH CHECK (true);

-- Functions for common operations

-- Function to get or create user
CREATE OR REPLACE FUNCTION get_or_create_user(session_id_param TEXT)
RETURNS UUID AS $$
DECLARE
    user_id UUID;
BEGIN
    -- Try to find existing user
    SELECT id INTO user_id FROM users WHERE session_id = session_id_param;
    
    -- If not found, create new user
    IF user_id IS NULL THEN
        INSERT INTO users (session_id) VALUES (session_id_param)
        RETURNING id INTO user_id;
    END IF;
    
    RETURN user_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get latest answers for user
CREATE OR REPLACE FUNCTION get_latest_answers(user_id_param UUID)
RETURNS TABLE(category TEXT, value INTEGER) AS $$
BEGIN
    RETURN QUERY
    SELECT DISTINCT ON (a.category) a.category, a.value
    FROM answers a
    WHERE a.user_id = user_id_param
    ORDER BY a.category, a.timestamp DESC;
END;
$$ LANGUAGE plpgsql; 