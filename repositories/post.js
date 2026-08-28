const { Op } = require('sequelize');
const sequelize = require('../db/sequelize');
const { Post } = require('../models');
const { sortPosts } = require('../utils/postSort');

async function findActivePostById(id, transaction) {
  const post = await Post.findOne({ where: { id, deleted_at: null }, transaction });
  return post ? post.get({ plain: true }) : null;
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
  await Post.update(fields, { where: { id }, transaction });
}

async function softDeletePost(id, transaction) {
  await Post.update({ deleted_at: sequelize.literal('now()') }, { where: { id }, transaction });
}

async function incrementCommentCount(id, transaction) {
  await Post.increment('comment_count', { by: 1, where: { id }, transaction });
}

async function adjustScore(id, delta, transaction) {
  await Post.increment('score', { by: delta, where: { id }, transaction });
}

async function listActivePostsByCommunity(communityId, sort) {
  const posts = await Post.findAll({ where: { community_id: communityId, deleted_at: null } });
  return sortPosts(posts.map((p) => p.get({ plain: true })), sort);
}

async function listActivePostsByCommunityIds(communityIds, sort, limit) {
  const posts = await Post.findAll({ where: { community_id: { [Op.in]: communityIds }, deleted_at: null } });
  return sortPosts(posts.map((p) => p.get({ plain: true })), sort).slice(0, limit);
}

async function listActivePostsByAuthor(authorId) {
  const posts = await Post.findAll({
    where: { author_id: authorId, deleted_at: null },
    order: [['created_at', 'DESC']],
  });
  return posts.map((p) => p.get({ plain: true }));
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
