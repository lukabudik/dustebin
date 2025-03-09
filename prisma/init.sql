-- Create the database if it doesn't exist
-- Note: This needs to be run as a superuser
-- CREATE DATABASE dustebin;

-- Connect to the database
-- \c dustebin

-- Create tables
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pastes (
  id TEXT PRIMARY KEY,
  content TEXT NOT NULL,
  language TEXT NOT NULL DEFAULT 'plaintext',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  password_hash TEXT,
  owner_id TEXT,
  views INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_pastes_language ON pastes(language);
CREATE INDEX IF NOT EXISTS idx_pastes_created_at ON pastes(created_at);
CREATE INDEX IF NOT EXISTS idx_pastes_owner_id ON pastes(owner_id);
CREATE INDEX IF NOT EXISTS idx_pastes_expires_at ON pastes(expires_at);

-- Add comments
COMMENT ON TABLE users IS 'Stores user information for paste ownership';
COMMENT ON TABLE pastes IS 'Stores code pastes with metadata';
COMMENT ON COLUMN pastes.content IS 'The actual code or text content of the paste';
COMMENT ON COLUMN pastes.language IS 'Programming language for syntax highlighting';
COMMENT ON COLUMN pastes.expires_at IS 'Optional timestamp when the paste should expire';
COMMENT ON COLUMN pastes.is_private IS 'Whether the paste is private or public';
COMMENT ON COLUMN pastes.password IS 'Optional password for protected pastes';
