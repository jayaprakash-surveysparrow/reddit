const logger = require('../utils/logger');
const sequelize = require('../db/sequelize');
const { findActivePostById, adjustScore: adjustPostScore } = require('../repositories/post');
const { findCommentById, adjustScore: adjustCommentScore } = require('../repositories/comment');
const {
  findPostVote,
  createPostVote,
  updatePostVoteValue,
  deletePostVote,
  findCommentVote,
  createCommentVote,
  updateCommentVoteValue,
  deleteCommentVote,
} = require('../repositories/vote');
const { invalidatePost } = require('../cache/invalidate');
const { searchIndexQueue } = require('../queues/searchIndexQueue');
const { activityQueue } = require('../queues/activityQueue');

const postOps = {
  findVote: findPostVote,
  createVote: createPostVote,
  updateVoteValue: updatePostVoteValue,
  deleteVote: deletePostVote,
  adjustScore: adjustPostScore,
  refetch: findActivePostById,
  // A comment vote affects the comment tree embedded in GET /posts/:id, so
  // both vote paths need to know which post's cache to bust — for a post
  // vote that's just the target itself; for a comment vote it's the
  // comment's parent post.
  postIdOf: (target) => target.id,
  searchEntity: 'post',
  // The post already carries its own community info (from flattenPost), so
  // no extra lookup is needed here — unlike commentOps below.
  getCommunityContext: async (target) => ({ communityId: target.community_id, communityName: target.community_name }),
};

const commentOps = {
  findVote: findCommentVote,
  createVote: createCommentVote,
  updateVoteValue: updateCommentVoteValue,
  deleteVote: deleteCommentVote,
  adjustScore: adjustCommentScore,
  refetch: findCommentById,
  postIdOf: (target) => target.post_id,
  searchEntity: 'comment',
  // A comment doesn't carry its own community info, so resolve it through
  // the parent post — one extra lookup, only on the vote path.
  getCommunityContext: async (target) => {
    const post = await findActivePostById(target.post_id);
    return post ? { communityId: post.community_id, communityName: post.community_name } : { communityId: null, communityName: null };
  },
};

function enqueueReindex(ops, targetId) {
  searchIndexQueue.add(`index-${ops.searchEntity}`, { entity: ops.searchEntity, action: 'upsert', id: targetId }).catch((err) => {
    logger.error(`Failed to enqueue search index job for ${ops.searchEntity} ${targetId}: ${err.message}`, { stack: err.stack });
  });
}

async function castOrChangeVote(req, res, target, ops) {
  const { value } = req.body;
  if (value !== 1 && value !== -1) return res.status(400).json({ error: 'value must be 1 or -1' });

  await sequelize.transaction(async (t) => {
    const existing = await ops.findVote(req.user.id, target.id, t);
    if (existing) {
      const delta = value - existing.value;
      if (delta !== 0) {
        await ops.updateVoteValue(existing.id, value, t);
        await ops.adjustScore(target.id, delta, t);
      }
    } else {
      await ops.createVote(req.user.id, target.id, value, t);
      await ops.adjustScore(target.id, value, t);
    }
  });

  await invalidatePost(ops.postIdOf(target));
  enqueueReindex(ops, target.id);

  const { communityId, communityName } = await ops.getCommunityContext(target);
  activityQueue.add('activity-vote-cast', {
    type: 'vote_cast',
    userId: req.user.id,
    username: req.user.username,
    communityId,
    communityName,
    targetType: ops.searchEntity,
    targetId: target.id,
    createdAt: new Date().toISOString(),
  }).catch((err) => {
    logger.error(`Failed to enqueue activity job for vote on ${ops.searchEntity} ${target.id}: ${err.message}`, { stack: err.stack });
  });

  const fresh = await ops.refetch(target.id);
  res.status(200).json({ target_id: target.id, value, score: fresh.score });
}

async function removeVote(req, res, target, ops) {
  let found = false;
  await sequelize.transaction(async (t) => {
    const existing = await ops.findVote(req.user.id, target.id, t);
    if (!existing) return;
    found = true;
    await ops.deleteVote(existing.id, t);
    await ops.adjustScore(target.id, -existing.value, t);
  });

  if (!found) return res.status(404).json({ error: 'No existing vote to remove' });

  await invalidatePost(ops.postIdOf(target));
  enqueueReindex(ops, target.id);

  const fresh = await ops.refetch(target.id);
  res.status(200).json({ target_id: target.id, score: fresh.score });
}

async function castOrChangePostVote(req, res) {
  try {
    const post = await findActivePostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    await castOrChangeVote(req, res, post, postOps);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function removePostVote(req, res) {
  try {
    const post = await findActivePostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    await removeVote(req, res, post, postOps);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function castOrChangeCommentVote(req, res) {
  try {
    const comment = await findCommentById(req.params.id);
    if (!comment || comment.deleted_at) return res.status(404).json({ error: 'Comment not found' });
    await castOrChangeVote(req, res, comment, commentOps);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function removeCommentVote(req, res) {
  try {
    const comment = await findCommentById(req.params.id);
    if (!comment || comment.deleted_at) return res.status(404).json({ error: 'Comment not found' });
    await removeVote(req, res, comment, commentOps);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { castOrChangePostVote, removePostVote, castOrChangeCommentVote, removeCommentVote };
