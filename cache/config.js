require('dotenv').config();

const DEFAULT_THRESHOLD = parseInt(process.env.CACHE_HOT_THRESHOLD, 10) || 5;
const DEFAULT_WINDOW_SECONDS = parseInt(process.env.CACHE_HOT_WINDOW_SECONDS, 10) || 60;

// Deliberately NOT here, and why:
//  - every POST/PATCH/PUT/DELETE: caching a write doesn't mean anything here.
//  - GET /users/me: low volume per user, and you expect to see your own just-
//    made edit immediately — the correctness risk isn't worth the benefit.
//  - GET /audit-logs: an audit trail is read for its freshness, not its
//    speed, and it's not a hot path.
//
// Each entry:
//  - ttlSeconds: how long a cached value is trusted, based on how fast the
//    underlying DATA goes stale — NOT how popular the route is. Popularity
//    is a separate axis, decided at request time by cache/hotness.js.
//  - buildKeyBase(req): the cache key, ignoring versioning.
//  - versionNamespace(req): present only for "list" caches with no single
//    resource id to delete on invalidation (see cache/version.js) — bumping
//    this counter orphans every previously cached page/sort/filter
//    combination at once, without needing to enumerate or SCAN for them.
//    Absent for single-resource caches, which are invalidated by deleting
//    their exact key directly instead (see cache/invalidate.js).
const routes = {
  listCommunities: {
    ttlSeconds: 30,
    buildKeyBase: (req) => `communities:q=${req.query.q || ''}:page=${req.query.page || 1}:limit=${req.query.limit || 20}`,
  },

  getCommunity: {
    ttlSeconds: 30,
    buildKeyBase: (req) => `community:${req.params.name.toLowerCase()}`,
  },

  listCommunityMembers: {
    ttlSeconds: 20,
    buildKeyBase: (req) =>
      `community-members:${req.params.name.toLowerCase()}:page=${req.query.page || 1}:limit=${req.query.limit || 20}`,
    versionNamespace: (req) => `community-members-version:${req.params.name.toLowerCase()}`,
  },

  listCommunityPosts: {
    ttlSeconds: 15,
    buildKeyBase: (req) =>
      `community-posts:${req.params.name.toLowerCase()}:sort=${req.query.sort || 'hot'}:page=${req.query.page || 1}:limit=${req.query.limit || 20}`,
    versionNamespace: (req) => `community-posts-version:${req.params.name.toLowerCase()}`,
  },

  getPost: {
    ttlSeconds: 10,
    buildKeyBase: (req) => `post:${req.params.id}`,
  },

  getPostComments: {
    ttlSeconds: 10,
    buildKeyBase: (req) => `post-comments:${req.params.id}`,
  },

  getUserProfile: {
    ttlSeconds: 60,
    buildKeyBase: (req) => `user-profile:${req.params.username.toLowerCase()}`,
  },

  getUserPosts: {
    ttlSeconds: 30,
    buildKeyBase: (req) =>
      `user-posts:${req.params.username.toLowerCase()}:page=${req.query.page || 1}:limit=${req.query.limit || 20}`,
    versionNamespace: (req) => `user-posts-version:${req.params.username.toLowerCase()}`,
  },

  getUserComments: {
    ttlSeconds: 30,
    buildKeyBase: (req) =>
      `user-comments:${req.params.username.toLowerCase()}:page=${req.query.page || 1}:limit=${req.query.limit || 20}`,
    versionNamespace: (req) => `user-comments-version:${req.params.username.toLowerCase()}`,
  },

  // Personalized: keyed per-user, so this only ever speeds up repeat
  // requests from the SAME user (pagination, pull-to-refresh), not shared
  // across everyone the way listCommunityPosts is. Still worth it — feed
  // re-requests are common — but it's a different economic case, not a
  // shared/public cache.
  getHomeFeed: {
    ttlSeconds: 30,
    buildKeyBase: (req) =>
      `feed:${req.user.id}:sort=${req.query.sort || 'hot'}:page=${req.query.page || 1}:limit=${req.query.limit || 20}`,
  },
};

module.exports = { routes, DEFAULT_THRESHOLD, DEFAULT_WINDOW_SECONDS };
