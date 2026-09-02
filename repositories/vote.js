const { PostVote, CommentVote } = require('../models');

async function findPostVote(userId, postId, transaction) {
  const vote = await PostVote.findOne({ where: { user_id: userId, post_id: postId }, transaction });
  return vote ? vote.get({ plain: true }) : null;
}

async function createPostVote(userId, postId, value, transaction) {
  const vote = await PostVote.create({ user_id: userId, post_id: postId, value }, { transaction });
  return vote.get({ plain: true });
}

async function updatePostVoteValue(id, value, transaction) {
  await PostVote.update(
    { value, created_at: new Date() },
    { where: { id }, transaction, individualHooks: true }
  );
}

async function deletePostVote(id, transaction) {
  await PostVote.destroy({ where: { id }, transaction, individualHooks: true });
}

async function findCommentVote(userId, commentId, transaction) {
  const vote = await CommentVote.findOne({ where: { user_id: userId, comment_id: commentId }, transaction });
  return vote ? vote.get({ plain: true }) : null;
}

async function createCommentVote(userId, commentId, value, transaction) {
  const vote = await CommentVote.create({ user_id: userId, comment_id: commentId, value }, { transaction });
  return vote.get({ plain: true });
}

async function updateCommentVoteValue(id, value, transaction) {
  await CommentVote.update(
    { value, created_at: new Date() },
    { where: { id }, transaction, individualHooks: true }
  );
}

async function deleteCommentVote(id, transaction) {
  await CommentVote.destroy({ where: { id }, transaction, individualHooks: true });
}

module.exports = {
  findPostVote,
  createPostVote,
  updatePostVoteValue,
  deletePostVote,
  findCommentVote,
  createCommentVote,
  updateCommentVoteValue,
  deleteCommentVote,
};
