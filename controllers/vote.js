const sequelize = require('../db/sequelize');
const { findActivePostById, adjustScore: adjustPostScore } = require('../repositories/post');
const { findCommentById, adjustScore: adjustCommentScore } = require('../repositories/comment');
const { findVote, createVote, updateVoteValue, deleteVote } = require('../repositories/vote');

const postOps = { adjustScore: adjustPostScore, refetch: findActivePostById };
const commentOps = { adjustScore: adjustCommentScore, refetch: findCommentById };

async function castOrChangeVote(req, res, targetType, target, ops) {
  const { userId, value } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  if (value !== 1 && value !== -1) return res.status(400).json({ error: 'value must be 1 or -1' });

  await sequelize.transaction(async (t) => {
    const existing = await findVote(userId, targetType, target.id, t);
    if (existing) {
      const delta = value - existing.value;
      if (delta !== 0) {
        await updateVoteValue(existing.id, value, t);
        await ops.adjustScore(target.id, delta, t);
      }
    } else {
      await createVote({ user_id: userId, target_type: targetType, target_id: target.id, value }, t);
      await ops.adjustScore(target.id, value, t);
    }
  });

  const fresh = await ops.refetch(target.id);
  res.status(200).json({ target_id: target.id, value, score: fresh.score });
}

async function removeVote(req, res, targetType, target, ops) {
  const { userId } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  let found = false;
  await sequelize.transaction(async (t) => {
    const existing = await findVote(userId, targetType, target.id, t);
    if (!existing) return;
    found = true;
    await deleteVote(existing.id, t);
    await ops.adjustScore(target.id, -existing.value, t);
  });

  if (!found) return res.status(404).json({ error: 'No existing vote to remove' });

  const fresh = await ops.refetch(target.id);
  res.status(200).json({ target_id: target.id, score: fresh.score });
}

async function castOrChangePostVote(req, res) {
  try {
    const post = await findActivePostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    await castOrChangeVote(req, res, 'post', post, postOps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function removePostVote(req, res) {
  try {
    const post = await findActivePostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    await removeVote(req, res, 'post', post, postOps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function castOrChangeCommentVote(req, res) {
  try {
    const comment = await findCommentById(req.params.id);
    if (!comment || comment.deleted_at) return res.status(404).json({ error: 'Comment not found' });
    await castOrChangeVote(req, res, 'comment', comment, commentOps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function removeCommentVote(req, res) {
  try {
    const comment = await findCommentById(req.params.id);
    if (!comment || comment.deleted_at) return res.status(404).json({ error: 'Comment not found' });
    await removeVote(req, res, 'comment', comment, commentOps);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { castOrChangePostVote, removePostVote, castOrChangeCommentVote, removeCommentVote };
