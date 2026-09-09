-- SkillSync-AI PostgreSQL database foundation.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL REFERENCES roles(id) ON DELETE RESTRICT,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    department VARCHAR(150),
    designation VARCHAR(150),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX ix_users_role_id ON users(role_id);
CREATE INDEX ix_users_department ON users(department);

CREATE TABLE skills (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    description TEXT
);
CREATE INDEX ix_skills_category ON skills(category);

CREATE TABLE competencies (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    description TEXT
);
CREATE INDEX ix_competencies_category ON competencies(category);

CREATE TABLE employee_skills (
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
    proficiency_level SMALLINT NOT NULL CHECK (proficiency_level BETWEEN 1 AND 5),
    assessed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, skill_id)
);
CREATE INDEX ix_employee_skills_skill_id ON employee_skills(skill_id);

CREATE TABLE skill_gaps (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
    current_level SMALLINT NOT NULL CHECK (current_level BETWEEN 1 AND 5),
    required_level SMALLINT NOT NULL CHECK (required_level BETWEEN 1 AND 5),
    gap_score NUMERIC(5,2) NOT NULL CHECK (gap_score >= 0),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    identified_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, skill_id)
);
CREATE INDEX ix_skill_gaps_user_priority ON skill_gaps(user_id, priority);
CREATE INDEX ix_skill_gaps_skill_id ON skill_gaps(skill_id);

CREATE TABLE courses (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    provider VARCHAR(150) NOT NULL,
    source VARCHAR(50) NOT NULL,
    external_course_id VARCHAR(150),
    category VARCHAR(100),
    difficulty VARCHAR(30) CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
    url TEXT,
    embedding vector,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (source, external_course_id)
);
CREATE INDEX ix_courses_source ON courses(source);
CREATE INDEX ix_courses_category ON courses(category);

CREATE TABLE course_skills (
    course_id BIGINT NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    skill_id BIGINT NOT NULL REFERENCES skills(id) ON DELETE RESTRICT,
    relevance_score NUMERIC(5,2) NOT NULL DEFAULT 1.00 CHECK (relevance_score BETWEEN 0 AND 1),
    PRIMARY KEY (course_id, skill_id)
);
CREATE INDEX ix_course_skills_skill_id ON course_skills(skill_id);

CREATE TABLE nssta_training (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    provider VARCHAR(150) NOT NULL,
    programme_type VARCHAR(100) NOT NULL,
    location VARCHAR(150),
    start_date DATE,
    end_date DATE,
    duration_minutes INTEGER CHECK (duration_minutes IS NULL OR duration_minutes > 0),
    eligibility TEXT,
    url TEXT,
    embedding vector,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_date IS NULL OR start_date IS NULL OR end_date >= start_date)
);
CREATE INDEX ix_nssta_training_dates ON nssta_training(start_date, end_date);
CREATE INDEX ix_nssta_training_programme_type ON nssta_training(programme_type);

CREATE TABLE learning_history (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id BIGINT REFERENCES courses(id) ON DELETE RESTRICT,
    nssta_training_id BIGINT REFERENCES nssta_training(id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_percentage NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
    score NUMERIC(5,2) CHECK (score IS NULL OR score BETWEEN 0 AND 100),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    CHECK ((course_id IS NOT NULL)::integer + (nssta_training_id IS NOT NULL)::integer = 1),
    CHECK (completed_at IS NULL OR started_at IS NULL OR completed_at >= started_at),
    UNIQUE NULLS NOT DISTINCT (user_id, course_id, nssta_training_id)
);
CREATE INDEX ix_learning_history_user_status ON learning_history(user_id, status);

CREATE TABLE assessments (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    assessment_type VARCHAR(100) NOT NULL,
    total_questions INTEGER NOT NULL DEFAULT 0 CHECK (total_questions >= 0),
    total_score NUMERIC(8,2) CHECK (total_score IS NULL OR total_score >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMPTZ
);
CREATE INDEX ix_assessments_user_id ON assessments(user_id);

CREATE TABLE assessment_questions (
    id BIGSERIAL PRIMARY KEY,
    assessment_id BIGINT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    skill_id BIGINT REFERENCES skills(id) ON DELETE SET NULL
);
CREATE INDEX ix_assessment_questions_assessment_id ON assessment_questions(assessment_id);
CREATE INDEX ix_assessment_questions_skill_id ON assessment_questions(skill_id);

CREATE TABLE assessment_results (
    id BIGSERIAL PRIMARY KEY,
    assessment_id BIGINT NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    score NUMERIC(8,2) NOT NULL CHECK (score >= 0),
    percentage NUMERIC(5,2) NOT NULL CHECK (percentage BETWEEN 0 AND 100),
    passed BOOLEAN NOT NULL,
    completed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (assessment_id, user_id)
);
CREATE INDEX ix_assessment_results_user_id ON assessment_results(user_id);

CREATE TABLE recommendations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id BIGINT REFERENCES courses(id) ON DELETE RESTRICT,
    nssta_training_id BIGINT REFERENCES nssta_training(id) ON DELETE RESTRICT,
    recommendation_score NUMERIC(5,2) NOT NULL CHECK (recommendation_score BETWEEN 0 AND 1),
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'viewed', 'accepted', 'dismissed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK ((course_id IS NOT NULL)::integer + (nssta_training_id IS NOT NULL)::integer = 1)
);
CREATE INDEX ix_recommendations_user_status ON recommendations(user_id, status);

-- Dimension-free vectors keep the model choice open. This table holds future RAG chunks.
CREATE TABLE learning_content_chunks (
    id BIGSERIAL PRIMARY KEY,
    course_id BIGINT REFERENCES courses(id) ON DELETE CASCADE,
    nssta_training_id BIGINT REFERENCES nssta_training(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    chunk_index INTEGER NOT NULL CHECK (chunk_index >= 0),
    embedding vector,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK ((course_id IS NOT NULL)::integer + (nssta_training_id IS NOT NULL)::integer = 1),
    UNIQUE NULLS NOT DISTINCT (course_id, nssta_training_id, chunk_index)
);
