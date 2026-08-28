const sequelize = require('../db/sequelize');
const { Comment } = require('../models');

async function findCommentById(id, transaction) {
  const comment = await Comment.findByPk(id, { transaction });
  return comment ? comment.get({ plain: true }) : null;
}

async function createComment(data, transaction) {
  const comment = await Comment.create(data, { transaction });
  return comment.get({ plain: true });
}

async function updateCommentBody(id, body, transaction) {
  await Comment.update({ body }, { where: { id }, transaction });
}

async function softDeleteComment(id, transaction) {
  await Comment.update({ deleted_at: sequelize.literal('now()') }, { where: { id }, transaction });
}

async function adjustScore(id, delta, transaction) {
  await Comment.increment('score', { by: delta, where: { id }, transaction });
}

// No deleted_at filter: the comment tree intentionally keeps soft-deleted
// comments visible so reply threads under them stay intact.
async function listCommentsByPost(postId) {
  const comments = await Comment.findAll({ where: { post_id: postId }, order: [['created_at', 'ASC']] });
  return comments.map((c) => c.get({ plain: true }));
}

async function listActiveCommentsByAuthor(authorId) {
  const comments = await Comment.findAll({
    where: { author_id: authorId, deleted_at: null },
    order: [['created_at', 'DESC']],
  });
  return comments.map((c) => c.get({ plain: true }));
}

module.exports = {
  findCommentById,
  createComment,
  updateCommentBody,
  softDeleteComment,
  adjustScore,
  listCommentsByPost,
  listActiveCommentsByAuthor,
};
