const logger = require('../utils/logger');
const sequelize = require('../db/sequelize');
const { isOwnerOrModerator } = require('../utils/permissions');
const { buildCommentTree } = require('../utils/commentTree');
const { findCommunityById } = require('../repositories/community');
const { findMembership } = require('../repositories/communityMember');
const { findPostById, findActivePostById, incrementCommentCount } = require('../repositories/post');
const {
  findCommentById,
  createComment: createCommentRow,
  updateCommentBody,
  softDeleteComment,
  listCommentsByPost,
} = require('../repositories/comment');
const { invalidatePost } = require('../cache/invalidate');

async function createComment(req, res) {
  try {
    const post = await findActivePostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const { body, parent_comment_id } = req.body;
    if (!body) return res.status(400).json({ error: 'body is required' });

    if (parent_comment_id) {
      const parent = await findCommentById(parent_comment_id);
      if (!parent || parent.post_id !== post.id) {
        return res.status(400).json({ error: 'parent_comment_id must reference a comment on the same post' });
      }
    }

    const comment = await sequelize.transaction(async (t) => {
      const created = await createCommentRow(
        { post_id: post.id, author_id: req.user.id, parent_comment_id: parent_comment_id || null, body },
        t
      );
      await incrementCommentCount(post.id, t);
      return created;
    });
    await invalidatePost(post.id);

    res.status(201).json(comment);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function getCommentTree(req, res) {
  try {
    const post = await findActivePostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comments = await listCommentsByPost(post.id);
    res.status(200).json({ comments: buildCommentTree(comments) });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function updateComment(req, res) {
  try {
    const comment = await findCommentById(req.params.id);
    if (!comment || comment.deleted_at) return res.status(404).json({ error: 'Comment not found' });

    const { body } = req.body;
    if (comment.author_id !== req.user.id) return res.status(403).json({ error: 'Only the comment author can do this' });

    if (!body) return res.status(400).json({ error: 'body is required' });
    await updateCommentBody(comment.id, body);
    await invalidatePost(comment.post_id);

    const updated = await findCommentById(comment.id);
    res.status(200).json(updated);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function deleteComment(req, res) {
  try {
    const comment = await findCommentById(req.params.id);
    if (!comment || comment.deleted_at) return res.status(404).json({ error: 'Comment not found' });

    let allowed = comment.author_id === req.user.id;
    if (!allowed) {
      const post = await findPostById(comment.post_id);
      const community = post ? await findCommunityById(post.community_id) : null;
      const membership = community ? await findMembership(community.id, req.user.id) : null;
      allowed = isOwnerOrModerator(membership);
    }
    if (!allowed) {
      return res.status(403).json({ error: 'Only the comment author or a community moderator can do this' });
    }

    await softDeleteComment(comment.id);
    await invalidatePost(comment.post_id);
    res.status(204).send();
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { createComment, getCommentTree, updateComment, deleteComment };
