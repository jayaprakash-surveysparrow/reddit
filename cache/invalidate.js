const redis = require('../db/redis');
const { bumpVersion } = require('./version');
const logger = require('../utils/logger');

// A failed invalidation (e.g. Redis unreachable) must never fail the
// mutation that triggered it — worst case, a cached view stays stale until
// its TTL expires, which is a much smaller problem than a legitimate DB
// write failing because of a caching side-effect.
async function safely(fn) {
  try {
    await fn();
  } catch (err) {
    logger.error('Cache invalidation failed', { error: err.message });
  }
}

function invalidateKey(key) {
  return safely(() => redis.del(`cache:${key}`));
}

async function invalidatePost(postId) {
  await invalidateKey(`post:${postId}`);
  await invalidateKey(`post-comments:${postId}`);
}

async function invalidateCommunity(name) {
  await invalidateKey(`community:${name.toLowerCase()}`);
}

async function invalidateCommunityPostsList(name) {
  await safely(() => bumpVersion(`community-posts-version:${name.toLowerCase()}`));
}

async function invalidateCommunityMembersList(name) {
  await safely(() => bumpVersion(`community-members-version:${name.toLowerCase()}`));
}

async function invalidateUserProfile(username) {
  await invalidateKey(`user-profile:${username.toLowerCase()}`);
}

async function invalidateUserPostsList(username) {
  await safely(() => bumpVersion(`user-posts-version:${username.toLowerCase()}`));
}

async function invalidateUserCommentsList(username) {
  await safely(() => bumpVersion(`user-comments-version:${username.toLowerCase()}`));
}

module.exports = {
  invalidatePost,
  invalidateCommunity,
  invalidateCommunityPostsList,
  invalidateCommunityMembersList,
  invalidateUserProfile,
  invalidateUserPostsList,
  invalidateUserCommentsList,
};
