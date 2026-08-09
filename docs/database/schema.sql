CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  preparation_setup_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  revoked_at timestamptz
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  used_at timestamptz
);
CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);

CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  website text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TYPE application_status AS ENUM (
  'INTERESTED','APPLIED','SHORTLISTED','ASSESSMENT','INTERVIEW','OFFER','REJECTED','WITHDRAWN'
);

CREATE TYPE source_type AS ENUM ('MANUAL','PASTED_TEXT','GMAIL','WHATSAPP');
CREATE TYPE ppo_type AS ENUM ('NONE','PPO','PERFORMANCE_BASED_PPO');

CREATE TABLE applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id),
  role text NOT NULL,
  location text,
  application_date timestamptz,
  deadline timestamptz,
  internship boolean NOT NULL DEFAULT false,
  ppo_type ppo_type NOT NULL DEFAULT 'NONE',
  stipend numeric(12,2),
  ctc numeric(12,2),
  status application_status NOT NULL DEFAULT 'INTERESTED',
  notes text,
  source source_type NOT NULL DEFAULT 'MANUAL',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_applications_user ON applications(user_id);
CREATE INDEX idx_applications_user_status ON applications(user_id, status);

CREATE TYPE round_type AS ENUM (
  'APPLICATION_SUBMITTED','SHORTLISTED','ONLINE_ASSESSMENT','TECHNICAL_INTERVIEW',
  'HR_ROUND','MANAGERIAL_ROUND','FINAL_RESULT','OTHER'
);
CREATE TYPE round_status AS ENUM ('UPCOMING','PREPARING','COMPLETED','CANCELLED');
CREATE TYPE round_mode AS ENUM ('ONLINE','OFFLINE','PHONE','TAKE_HOME');

CREATE TABLE rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  type round_type NOT NULL,
  title text NOT NULL,
  scheduled_at timestamptz,
  duration integer,
  mode round_mode,
  status round_status NOT NULL DEFAULT 'UPCOMING',
  notes text,
  source source_type NOT NULL DEFAULT 'MANUAL',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_rounds_application ON rounds(application_id);
CREATE INDEX idx_rounds_scheduled_at ON rounds(scheduled_at);

CREATE TABLE experiences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id uuid NOT NULL UNIQUE REFERENCES rounds(id) ON DELETE CASCADE,
  summary text,
  what_went_well text,
  what_went_badly text,
  confidence integer,
  overall_reflection text,
  topics_covered text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TYPE question_category AS ENUM (
  'DSA','DBMS','SQL','OS','OOP','SYSTEM_DESIGN','PROJECTS','BEHAVIORAL','OTHER'
);
CREATE TYPE difficulty AS ENUM ('EASY','MEDIUM','HARD');
CREATE TYPE performance AS ENUM ('POOR','AVERAGE','GOOD','EXCELLENT');

CREATE TABLE questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  experience_id uuid NOT NULL REFERENCES experiences(id) ON DELETE CASCADE,
  question text NOT NULL,
  category question_category NOT NULL,
  topic text,
  difficulty difficulty,
  performance performance,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_questions_experience ON questions(experience_id);
CREATE INDEX idx_questions_category ON questions(category);

CREATE TYPE learning_category AS ENUM (
  'COMMUNICATION','TECHNICAL','TIME_MANAGEMENT','PROBLEM_SOLVING','BEHAVIORAL','OTHER'
);
CREATE TYPE learning_priority AS ENUM ('LOW','MEDIUM','HIGH');
CREATE TYPE learning_status AS ENUM ('OPEN','IN_PROGRESS','RESOLVED');

CREATE TABLE learnings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category learning_category NOT NULL,
  priority learning_priority NOT NULL DEFAULT 'MEDIUM',
  source_type text,
  source_id text,
  status learning_status NOT NULL DEFAULT 'OPEN',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_learnings_user ON learnings(user_id);
CREATE INDEX idx_learnings_user_category ON learnings(user_id, category);

CREATE TYPE action_item_status AS ENUM ('PENDING','IN_PROGRESS','DONE');

CREATE TABLE action_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  learning_id uuid NOT NULL REFERENCES learnings(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  status action_item_status NOT NULL DEFAULT 'PENDING',
  due_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_action_items_learning ON action_items(learning_id);

CREATE TABLE preparation_topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  parent_id uuid REFERENCES preparation_topics(id),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  is_custom boolean NOT NULL DEFAULT false,
  UNIQUE(name, parent_id, user_id)
);

CREATE TABLE preparation_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES preparation_topics(id) ON DELETE CASCADE,
  initial_level integer,
  questions_solved integer NOT NULL DEFAULT 0,
  questions_total integer NOT NULL DEFAULT 0,
  confidence integer NOT NULL DEFAULT 0,
  last_practiced timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

CREATE TABLE preparation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id uuid REFERENCES preparation_topics(id) ON DELETE SET NULL,
  date date NOT NULL,
  questions_solved integer NOT NULL DEFAULT 0,
  duration_minutes integer,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_preparation_logs_user_date ON preparation_logs(user_id, date);

CREATE TABLE preparation_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider text NOT NULL,
  profile_url text NOT NULL,
  metrics jsonb,
  last_synced_at timestamptz,
  last_sync_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, provider)
);
