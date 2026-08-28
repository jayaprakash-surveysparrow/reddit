-- Users schema
-- joined_communities is intentionally NOT a column here: it's a many-to-many
-- relationship (a user belongs to many communities, a community has many
-- members) and will be modeled as a community_members join table once the
-- communities schema is designed, with a foreign key to this table's id.

CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username      VARCHAR(30) NOT NULL,
  email         VARCHAR(255) NOT NULL,
  password_hash TEXT NOT NULL,
  karma         INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Case-insensitive uniqueness: the app looks users up by
-- username/email.toLowerCase(), so uniqueness must be enforced the same way.
CREATE UNIQUE INDEX users_username_lower_idx ON users (LOWER(username));
CREATE UNIQUE INDEX users_email_lower_idx ON users (LOWER(email));

-- Password reset tokens
-- Only the SHA-256 hash of the token is stored (same reasoning as
-- password_hash on users: a leaked row must not be a usable secret).
-- Consumption is single-use (used_at) and time-boxed (expires_at); the
-- reset-password endpoint locks the matching row with SELECT ... FOR UPDATE
-- inside a transaction so the same token can't be spent twice concurrently.

CREATE TABLE password_reset_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX password_reset_tokens_token_hash_idx ON password_reset_tokens (token_hash);
CREATE INDEX password_reset_tokens_user_id_idx ON password_reset_tokens (user_id);

-- Refresh tokens
-- Same reasoning as password_reset_tokens: only the SHA-256 hash of the
-- actual JWT is stored. The JWT's own `exp` claim caps its lifetime at 7
-- days; revoked_at lets a token be killed earlier (logout, or rotation on
-- every /refresh call) without waiting for that expiry.

CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX refresh_tokens_token_hash_idx ON refresh_tokens (token_hash);
CREATE INDEX refresh_tokens_user_id_idx ON refresh_tokens (user_id);

-- Communities schema

CREATE TABLE communities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(21) NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  created_by   UUID NOT NULL REFERENCES users(id),
  member_count INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at   TIMESTAMPTZ
);

-- Case-insensitive uniqueness, but only among non-deleted communities: the
-- app allows a deleted community's name to be reused, so the index is
-- partial rather than covering the whole table.
CREATE UNIQUE INDEX communities_name_lower_idx ON communities (LOWER(name)) WHERE deleted_at IS NULL;

-- Community membership: replaces the embedded members[] / joined_communities[]
-- arrays from the mock data with a real many-to-many join table.
CREATE TABLE community_members (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role         VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'moderator', 'member')),
  joined_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (community_id, user_id)
);

CREATE INDEX community_members_user_id_idx ON community_members (user_id);

-- Posts schema

CREATE TABLE posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id  UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id     UUID NOT NULL REFERENCES users(id),
  title         VARCHAR(300) NOT NULL,
  body          TEXT,
  url           TEXT,
  post_type     VARCHAR(10) NOT NULL CHECK (post_type IN ('text', 'link')),
  score         INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ
);

CREATE INDEX posts_community_id_idx ON posts (community_id);
CREATE INDEX posts_author_id_idx ON posts (author_id);

-- Comments schema

CREATE TABLE comments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id           UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id         UUID NOT NULL REFERENCES users(id),
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  body              TEXT NOT NULL,
  score             INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX comments_post_id_idx ON comments (post_id);
CREATE INDEX comments_parent_comment_id_idx ON comments (parent_comment_id);

-- Votes schema
-- target_id intentionally has no foreign key: it polymorphically references
-- either posts or comments depending on target_type, which a single FK
-- can't express. That reference is validated at the application layer.

CREATE TABLE votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  target_type VARCHAR(10) NOT NULL CHECK (target_type IN ('post', 'comment')),
  target_id   UUID NOT NULL,
  value       SMALLINT NOT NULL CHECK (value IN (1, -1)),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, target_type, target_id)
);

CREATE INDEX votes_target_idx ON votes (target_type, target_id);
