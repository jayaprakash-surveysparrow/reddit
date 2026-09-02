const { Op } = require('sequelize');
const { Post, User, Community } = require('../models');
const { postOrderClause } = require('../utils/postOrder');

// required: false on both includes matters: author_id/community_id can be
// null (author deleted) — a default INNER JOIN would silently drop those
// posts from every list/lookup instead of showing them with a null author.
const DISPLAY_INCLUDES = [
  { model: User, as: 'author', attributes: ['id', 'username'], required: false },
  { model: Community, as: 'community', attributes: ['id', 'name'], required: false },
];

function flattenPost(instance) {
  const post = instance.get({ plain: true });
  const author_username = post.author ? post.author.username : null;
  const community_name = post.community ? post.community.name : null;
  delete post.author;
  delete post.community;
  return { ...post, author_username, community_name };
}

async function findActivePostById(id, transaction) {
  const post = await Post.findOne({
    where: { id, deleted_at: null },
    include: DISPLAY_INCLUDES,
    transaction,
  });
  return post ? flattenPost(post) : null;
}

async function findPostById(id, transaction) {
  const post = await Post.findByPk(id, { transaction });
  return post ? post.get({ plain: true }) : null;
}

async function createPost(data, transaction) {
  const post = await Post.create(data, { transaction });
  return post.get({ plain: true });
}

async function updatePostFields(id, fields, transaction) {
  await Post.update(fields, { where: { id }, transaction, individualHooks: true });
}

async function softDeletePost(id, transaction) {
  await Post.update(
    { deleted_at: new Date() },
    { where: { id }, transaction, individualHooks: true }
  );
}

async function incrementCommentCount(id, transaction) {
  await Post.increment('comment_count', { by: 1, where: { id }, transaction });
}

async function adjustScore(id, delta, transaction) {
  await Post.increment('score', { by: delta, where: { id }, transaction });
}

async function listActivePostsByCommunity(communityId, sort, limit, offset) {
  const posts = await Post.findAll({
    where: { community_id: communityId, deleted_at: null },
    include: DISPLAY_INCLUDES,
    order: postOrderClause(sort),
    limit,
    offset,
  });
  return posts.map(flattenPost);
}

async function listActivePostsByCommunityIds(communityIds, sort, limit, offset) {
  const posts = await Post.findAll({
    where: { community_id: { [Op.in]: communityIds }, deleted_at: null },
    include: DISPLAY_INCLUDES,
    order: postOrderClause(sort),
    limit,
    offset,
  });
  return posts.map(flattenPost);
}

async function listActivePostsByAuthor(authorId, limit, offset) {
  const posts = await Post.findAll({
    where: { author_id: authorId, deleted_at: null },
    include: DISPLAY_INCLUDES,
    order: [['created_at', 'DESC']],
    limit,
    offset,
  });
  return posts.map(flattenPost);
}

module.exports = {
  findActivePostById,
  findPostById,
  createPost,
  updatePostFields,
  softDeletePost,
  incrementCommentCount,
  adjustScore,
  listActivePostsByCommunity,
  listActivePostsByCommunityIds,
  listActivePostsByAuthor,
};
