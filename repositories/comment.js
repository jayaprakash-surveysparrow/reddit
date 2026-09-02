const { Comment, User } = require('../models');

const AUTHOR_INCLUDE = [{ model: User, as: 'author', attributes: ['id', 'username'], required: false }];

function flattenComment(instance) {
  const comment = instance.get({ plain: true });
  const author_username = comment.author ? comment.author.username : null;
  delete comment.author;
  return { ...comment, author_username };
}

async function findCommentById(id, transaction) {
  const comment = await Comment.findByPk(id, { include: AUTHOR_INCLUDE, transaction });
  return comment ? flattenComment(comment) : null;
}

async function createComment(data, transaction) {
  const comment = await Comment.create(data, { transaction });
  return comment.get({ plain: true });
}

async function updateCommentBody(id, body, transaction) {
  await Comment.update({ body }, { where: { id }, transaction, individualHooks: true });
}

async function softDeleteComment(id, transaction) {
  await Comment.update(
    { deleted_at: new Date() },
    { where: { id }, transaction, individualHooks: true }
  );
}

async function adjustScore(id, delta, transaction) {
  await Comment.increment('score', { by: delta, where: { id }, transaction });
}

// No deleted_at filter: the comment tree intentionally keeps soft-deleted
// comments visible so reply threads under them stay intact.
//
// MAX_COMMENTS_PER_POST is a safety cap, not real pagination: building a
// correct paginated view of a threaded tree means paginating root comments
// and then fetching each returned root's full descendant chain, which is a
// bigger feature on its own. This cap at least bounds memory/response size
// for a pathological post with an enormous number of comments in the
// meantime, rather than fetching an unbounded number of rows.
const MAX_COMMENTS_PER_POST = 1000;

async function listCommentsByPost(postId) {
  const comments = await Comment.findAll({
    where: { post_id: postId },
    include: AUTHOR_INCLUDE,
    order: [['created_at', 'ASC']],
    limit: MAX_COMMENTS_PER_POST,
  });
  return comments.map(flattenComment);
}

async function listActiveCommentsByAuthor(authorId, limit, offset) {
  const comments = await Comment.findAll({
    where: { author_id: authorId, deleted_at: null },
    order: [['created_at', 'DESC']],
    limit,
    offset,
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
