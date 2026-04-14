-- Submissions table for Construction Operations Diagnostic
-- Run this in Supabase SQL Editor to create the table

CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  first_name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  trade TEXT NOT NULL,
  contact_submitted_at TIMESTAMP WITH TIME ZONE,

  -- Raw question responses
  question_responses JSONB,

  -- Overall scoring
  final_score NUMERIC(5,2),
  overall_percent NUMERIC(5,2),

  -- Category-level scores
  category_percents JSONB, -- { "category_id": 75, ... }
  category_bands JSONB,    -- { "category_id": "high", ... }

  -- Section-level scores
  section_percents JSONB,  -- { "section_id": 82, ... }
  section_bands JSONB,     -- { "section_id": "high", ... }

  -- Priority areas
  primary_constraint TEXT,
  secondary_constraint TEXT,
  top_strength TEXT,

  -- Complete report for display
  full_report JSONB
);

-- Indexes for fast queries
CREATE INDEX idx_submissions_email ON submissions(email);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX idx_submissions_company ON submissions(company);
CREATE INDEX idx_submissions_trade ON submissions(trade);
