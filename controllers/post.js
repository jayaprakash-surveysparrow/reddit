const logger = require('../utils/logger');
const { isOwnerOrModerator } = require('../utils/permissions');
const { parsePagination } = require('../utils/pagination');
const { buildCommentTree } = require('../utils/commentTree');
const { findActiveCommunityByName, findCommunityById } = require('../repositories/community');
const { findMembership, listJoinedCommunityIds } = require('../repositories/communityMember');
const { listCommentsByPost } = require('../repositories/comment');
const {
  findActivePostById,
  createPost: createPostRow,
  updatePostFields,
  softDeletePost,
  listActivePostsByCommunity,
  listActivePostsByCommunityIds,
} = require('../repositories/post');
const { invalidatePost, invalidateCommunityPostsList } = require('../cache/invalidate');
const {notificationQueue} = require('../queues/notificationQueue');
const {searchIndexQueue} = require('../queues/searchIndexQueue');
const {activityQueue} = require('../queues/activityQueue');


async function createPost(req, res) {
  try {
    const community = await findActiveCommunityByName(req.params.name);
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const { title, body, url, post_type } = req.body;

    const membership = await findMembership(community.id, req.user.id);
    if (!membership) return res.status(403).json({ error: 'Join the community before posting' });

    if (!title) return res.status(400).json({ error: 'title is required' });
    if (!['text', 'link'].includes(post_type)) {
      return res.status(400).json({ error: "post_type must be 'text' or 'link'" });
    }
    if (post_type === 'link' && !url) return res.status(400).json({ error: 'url is required for link posts' });

    const post = await createPostRow({
      community_id: community.id,
      author_id: req.user.id,
      title,
      body: post_type === 'text' ? body || null : null,
      url: post_type === 'link' ? url : null,
      post_type,
    });

    await invalidateCommunityPostsList(community.name);

    notificationQueue.add('post-notification', {
      postId: post.id,
      communityId: community.id,
      authorId: req.user.id,
    }).catch((err)=>{
      logger.error(`Failed to enqueue notification job for post ${post.id}: ${err.message}`, {stack: err.stack});
    });

    searchIndexQueue.add('index-post', { entity: 'post', action: 'upsert', id: post.id }).catch((err) => {
      logger.error(`Failed to enqueue search index job for post ${post.id}: ${err.message}`, { stack: err.stack });
    });

    activityQueue.add('activity-post-created', {
      type: 'post_created',
      userId: req.user.id,
      username: req.user.username,
      communityId: community.id,
      communityName: community.name,
      targetType: 'post',
      targetId: post.id,
      createdAt: post.created_at,
    }).catch((err) => {
      logger.error(`Failed to enqueue activity job for post ${post.id}: ${err.message}`, { stack: err.stack });
    });

    res.status(201).json(post);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function getPost(req, res) {
  try {
    const post = await findActivePostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const comments = await listCommentsByPost(post.id);
    res.status(200).json({ ...post, comments: buildCommentTree(comments) });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function updatePost(req, res) {
  try {
    const post = await findActivePostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const { title, body, url } = req.body;
    if (post.author_id !== req.user.id) return res.status(403).json({ error: 'Only the post author can do this' });

    const fields = {};
    if (title !== undefined) fields.title = title;
    if (body !== undefined) fields.body = body;
    if (url !== undefined) fields.url = url;
    if (Object.keys(fields).length > 0) {
      await updatePostFields(post.id, fields);
      await invalidatePost(post.id);
      searchIndexQueue.add('index-post', { entity: 'post', action: 'upsert', id: post.id }).catch((err) => {
        logger.error(`Failed to enqueue search index job for post ${post.id}: ${err.message}`, { stack: err.stack });
      });
    }

    const updated = await findActivePostById(post.id);
    res.status(200).json(updated);
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function deletePost(req, res) {
  try {
    const post = await findActivePostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const community = await findCommunityById(post.community_id);

    let allowed = post.author_id === req.user.id;
    if (!allowed) {
      const membership = community ? await findMembership(community.id, req.user.id) : null;
      allowed = isOwnerOrModerator(membership);
    }
    if (!allowed) return res.status(403).json({ error: 'Only the post author or a community moderator can do this' });

    await softDeletePost(post.id);
    await invalidatePost(post.id);
    searchIndexQueue.add('index-post', { entity: 'post', action: 'delete', id: post.id }).catch((err) => {
      logger.error(`Failed to enqueue search index job for post ${post.id}: ${err.message}`, { stack: err.stack });
    });
    if (community) await invalidateCommunityPostsList(community.name);
    res.status(204).send();
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function listCommunityPosts(req, res) {
  try {
    const community = await findActiveCommunityByName(req.params.name);
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const { limit, offset, page } = parsePagination(req.query);
    const posts = await listActivePostsByCommunity(community.id, req.query.sort, limit, offset);
    res.status(200).json({ posts, page, limit });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function getHomeFeed(req, res) {
  try {
    const { limit, offset, page } = parsePagination(req.query);
    const communityIds = await listJoinedCommunityIds(req.user.id);

    const posts = communityIds.length
      ? await listActivePostsByCommunityIds(communityIds, req.query.sort, limit, offset)
      : [];

    res.status(200).json({ posts, page, limit });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = {
  createPost,
  getPost,
  updatePost,
  deletePost,
  listCommunityPosts,
  getHomeFeed,
};
