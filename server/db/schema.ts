// ============================================================
// TalentFlow SAP - Database Schema (SQLite)
// ============================================================

export const SCHEMA = `
-- Talents / Candidates
CREATE TABLE IF NOT EXISTS talents (
  id TEXT PRIMARY KEY,
  full_name TEXT NOT NULL,
  preferred_name TEXT,
  email TEXT,
  phone TEXT,
  linkedin_url TEXT,
  github_url TEXT,
  location TEXT NOT NULL DEFAULT 'Brazil',
  state TEXT,
  city TEXT,

  -- SAP Profile
  sap_modules TEXT DEFAULT '[]',
  sap_certifications TEXT DEFAULT '[]',
  experience_level TEXT NOT NULL CHECK(experience_level IN ('entry','experienced','lead','expert')),
  years_of_experience INTEGER,
  current_role TEXT,
  current_company TEXT,
  skills TEXT DEFAULT '[]',
  languages TEXT DEFAULT '["Portuguese"]',

  -- Sourcing
  source TEXT NOT NULL DEFAULT 'manual',
  source_details TEXT,
  discovered_at TEXT NOT NULL DEFAULT (datetime('now')),

  -- Funnel
  funnel_stage TEXT NOT NULL DEFAULT 'discovered',
  engagement_score INTEGER NOT NULL DEFAULT 0,
  interest_signals TEXT DEFAULT '[]',

  -- Gamification
  profile_completeness INTEGER NOT NULL DEFAULT 0,
  challenges_completed TEXT DEFAULT '[]',
  badges_earned TEXT DEFAULT '[]',
  points INTEGER NOT NULL DEFAULT 0,

  -- LGPD
  consent_status TEXT NOT NULL DEFAULT 'pending',
  consent_date TEXT,
  data_processing_basis TEXT NOT NULL DEFAULT 'legitimate_interest',

  -- Personalization
  personality_insights TEXT,
  content_preferences TEXT DEFAULT '[]',
  communication_preference TEXT DEFAULT 'email',
  best_contact_time TEXT,

  -- Metadata
  tags TEXT DEFAULT '[]',
  notes TEXT DEFAULT '',
  last_contacted_at TEXT,
  next_follow_up_at TEXT,
  assigned_to TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_talents_experience ON talents(experience_level);
CREATE INDEX IF NOT EXISTS idx_talents_stage ON talents(funnel_stage);
CREATE INDEX IF NOT EXISTS idx_talents_source ON talents(source);
CREATE INDEX IF NOT EXISTS idx_talents_engagement ON talents(engagement_score);
CREATE INDEX IF NOT EXISTS idx_talents_consent ON talents(consent_status);

-- Campaigns
CREATE TABLE IF NOT EXISTS campaigns (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft',
  target_experience_levels TEXT DEFAULT '[]',
  target_sap_modules TEXT DEFAULT '[]',
  target_locations TEXT DEFAULT '[]',
  channel TEXT NOT NULL DEFAULT 'email',
  steps TEXT DEFAULT '[]',

  total_targets INTEGER DEFAULT 0,
  sent INTEGER DEFAULT 0,
  delivered INTEGER DEFAULT 0,
  opened INTEGER DEFAULT 0,
  responded INTEGER DEFAULT 0,
  engaged INTEGER DEFAULT 0,

  accenture_assets TEXT DEFAULT '[]',

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Message Templates
CREATE TABLE IF NOT EXISTS message_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'email',
  subject TEXT,
  body TEXT NOT NULL,
  variables TEXT DEFAULT '[]',
  experience_level TEXT NOT NULL DEFAULT 'all',
  category TEXT NOT NULL DEFAULT 'initial_outreach',

  times_sent INTEGER DEFAULT 0,
  response_rate REAL DEFAULT 0,
  engagement_rate REAL DEFAULT 0,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Outreach History (individual messages sent)
CREATE TABLE IF NOT EXISTS outreach_history (
  id TEXT PRIMARY KEY,
  talent_id TEXT NOT NULL,
  campaign_id TEXT,
  template_id TEXT,
  channel TEXT NOT NULL,
  subject TEXT,
  body TEXT NOT NULL,
  personalized_elements TEXT DEFAULT '[]',
  status TEXT NOT NULL DEFAULT 'pending',
  sent_at TEXT,
  delivered_at TEXT,
  opened_at TEXT,
  responded_at TEXT,
  response_text TEXT,
  engagement_action TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (talent_id) REFERENCES talents(id),
  FOREIGN KEY (campaign_id) REFERENCES campaigns(id)
);

CREATE INDEX IF NOT EXISTS idx_outreach_talent ON outreach_history(talent_id);
CREATE INDEX IF NOT EXISTS idx_outreach_campaign ON outreach_history(campaign_id);
CREATE INDEX IF NOT EXISTS idx_outreach_status ON outreach_history(status);

-- Challenges (Gamification)
CREATE TABLE IF NOT EXISTS challenges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'quiz',
  difficulty TEXT NOT NULL DEFAULT 'entry',
  sap_module TEXT,
  points INTEGER NOT NULL DEFAULT 100,
  badge_id TEXT,
  time_limit INTEGER,
  content TEXT NOT NULL DEFAULT '{}',
  is_active INTEGER NOT NULL DEFAULT 1,
  completions INTEGER DEFAULT 0,
  avg_score REAL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Badges
CREATE TABLE IF NOT EXISTS badges (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'award',
  category TEXT NOT NULL DEFAULT 'skill',
  requirement TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common'
);

-- Content Hub
CREATE TABLE IF NOT EXISTS content_pieces (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'article',
  source TEXT NOT NULL DEFAULT 'accenture',
  url TEXT,
  summary TEXT NOT NULL DEFAULT '',
  sap_modules TEXT DEFAULT '[]',
  experience_level TEXT NOT NULL DEFAULT 'all',
  tags TEXT DEFAULT '[]',
  engagement_count INTEGER DEFAULT 0,
  is_accenture_asset INTEGER DEFAULT 0,
  published_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Talent Activity Log (for engagement tracking)
CREATE TABLE IF NOT EXISTS talent_activity (
  id TEXT PRIMARY KEY,
  talent_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  details TEXT DEFAULT '{}',
  points_earned INTEGER DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (talent_id) REFERENCES talents(id)
);

CREATE INDEX IF NOT EXISTS idx_activity_talent ON talent_activity(talent_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON talent_activity(activity_type);

-- LGPD Consent Log
CREATE TABLE IF NOT EXISTS consent_log (
  id TEXT PRIMARY KEY,
  talent_id TEXT NOT NULL,
  action TEXT NOT NULL,
  basis TEXT NOT NULL,
  details TEXT DEFAULT '',
  ip_address TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (talent_id) REFERENCES talents(id)
);

CREATE INDEX IF NOT EXISTS idx_consent_talent ON consent_log(talent_id);
`;
