CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  session_id VARCHAR(200) PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO users (username, password_hash, full_name)
VALUES ('alice', crypt('123', gen_salt('bf')), 'Alice Silva')
ON CONFLICT (username) DO NOTHING;

INSERT INTO users (username, password_hash, full_name)
VALUES ('bob', crypt('123', gen_salt('bf')), 'Bob Souza')
ON CONFLICT (username) DO NOTHING;
