require('dotenv').config();

const DEFAULT_THRESHOLD = parseInt(process.env.CACHE_HOT_THRESHOLD, 10) || 5;
const DEFAULT_WINDOW_SECONDS = parseInt(process.env.CACHE_HOT_WINDOW_SECONDS, 10) || 60;

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
