const redis = require('../db/redis');
const { bumpVersion } = require('./version');
const logger = require('../utils/logger');

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
