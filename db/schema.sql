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
-- days as a ceiling; a row being killed earlier (logout, or rotation on
-- every /refresh call) is modeled by deleting the row outright rather than
-- marking it revoked — a row's mere existence means "still valid," so there's
-- no revoked flag to maintain or filter on.

CREATE TABLE refresh_tokens (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX refresh_tokens_token_hash_idx ON refresh_tokens (token_hash);
CREATE INDEX refresh_tokens_user_id_idx ON refresh_tokens (user_id);

-- Communities schema

-- created_by is nullable with ON DELETE SET NULL rather than NOT NULL/RESTRICT:
-- a user who created a community must still be deletable without being
-- forced to first delete or reassign every community they ever created.
CREATE TABLE communities (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         VARCHAR(21) NOT NULL,
  description  TEXT NOT NULL DEFAULT '',
  created_by   UUID REFERENCES users(id) ON DELETE SET NULL,
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
-- author_id is nullable with ON DELETE SET NULL: deleting a user's account
-- should not be blocked by, or cascade-destroy, every post they ever made —
-- the post survives with a null author (displayed as e.g. "[deleted user]").

CREATE TABLE posts (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  community_id  UUID NOT NULL REFERENCES communities(id) ON DELETE CASCADE,
  author_id     UUID REFERENCES users(id) ON DELETE SET NULL,
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
-- author_id: same ON DELETE SET NULL reasoning as posts.author_id.
-- comment_count on posts is NOT decremented when a comment is soft-deleted:
-- deleted comments intentionally stay visible in the tree (see
-- listCommentsByPost) so replies under them keep their structure, so the
-- count deliberately reflects "how many comment nodes render," not "how many
-- have visible content" — decrementing here would make the two disagree.

CREATE TABLE comments (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id           UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id         UUID REFERENCES users(id) ON DELETE SET NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  body              TEXT NOT NULL,
  score             INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);

CREATE INDEX comments_post_id_idx ON comments (post_id);
CREATE INDEX comments_parent_comment_id_idx ON comments (parent_comment_id);

-- Votes schema
-- Split into post_votes/comment_votes rather than one polymorphic table with
-- a target_type/target_id pair: a single votes table can't have a real
-- foreign key on its target (it might point at posts or comments), which
-- means no referential integrity, no cascade on target deletion, and no
-- plain JOIN back to the target — every query needs a target_type branch.
-- Two concrete tables trade a little code duplication for a real FK, real
-- cascade, and a normal JOIN.

CREATE TABLE post_votes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  post_id    UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  value      SMALLINT NOT NULL CHECK (value IN (1, -1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, post_id)
);

CREATE INDEX post_votes_post_id_idx ON post_votes (post_id);

CREATE TABLE comment_votes (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  value      SMALLINT NOT NULL CHECK (value IN (1, -1)),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, comment_id)
);

CREATE INDEX comment_votes_comment_id_idx ON comment_votes (comment_id);

-- Audit log
-- entity_id has no foreign key: unlike votes above, this table deliberately
-- stays a single generic table spanning many different target tables (users,
-- communities, posts, comments, votes...). Splitting it the way votes was
-- split would be the wrong fix here — the entire point of an audit log is
-- one place to query "everything that ever happened to X" or "everything
-- actor Y ever did," across every entity type, in one query.
-- actor_id is nullable with ON DELETE SET NULL so the audit trail survives
-- the acting user's account being deleted later — losing that history is
-- exactly the opposite of what an audit log is for.

CREATE TABLE audit_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id   UUID,
  action      VARCHAR(10) NOT NULL CHECK (action IN ('create', 'update', 'delete')),
  actor_id    UUID REFERENCES users(id) ON DELETE SET NULL,
  changes     JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_entity_idx ON audit_logs (entity_type, entity_id);
CREATE INDEX audit_logs_actor_id_idx ON audit_logs (actor_id);
CREATE INDEX audit_logs_created_at_idx ON audit_logs (created_at DESC);
