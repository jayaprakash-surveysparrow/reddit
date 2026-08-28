const { isOwnerOrModerator } = require('../utils/permissions');
const { findActiveCommunityByName, findCommunityById } = require('../repositories/community');
const { findMembership, listJoinedCommunityIds } = require('../repositories/communityMember');
const { findUserById } = require('../repositories/user');
const {
  findActivePostById,
  createPost: createPostRow,
  updatePostFields,
  softDeletePost,
  listActivePostsByCommunity,
  listActivePostsByCommunityIds,
} = require('../repositories/post');

async function createPost(req, res) {
  try {
    const community = await findActiveCommunityByName(req.params.name);
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const { userId, title, body, url, post_type } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const membership = await findMembership(community.id, userId);
    if (!membership) return res.status(403).json({ error: 'Join the community before posting' });

    if (!title) return res.status(400).json({ error: 'title is required' });
    if (!['text', 'link'].includes(post_type)) {
      return res.status(400).json({ error: "post_type must be 'text' or 'link'" });
    }
    if (post_type === 'link' && !url) return res.status(400).json({ error: 'url is required for link posts' });

    const post = await createPostRow({
      community_id: community.id,
      author_id: userId,
      title,
      body: post_type === 'text' ? body || null : null,
      url: post_type === 'link' ? url : null,
      post_type,
    });

    res.status(201).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function getPost(req, res) {
  try {
    const post = await findActivePostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.status(200).json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function updatePost(req, res) {
  try {
    const post = await findActivePostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const { userId, title, body, url } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });
    if (post.author_id !== userId) return res.status(403).json({ error: 'Only the post author can do this' });

    const fields = {};
    if (title !== undefined) fields.title = title;
    if (body !== undefined) fields.body = body;
    if (url !== undefined) fields.url = url;
    if (Object.keys(fields).length > 0) await updatePostFields(post.id, fields);

    const updated = await findActivePostById(post.id);
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function deletePost(req, res) {
  try {
    const post = await findActivePostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId is required' });

    let allowed = post.author_id === userId;
    if (!allowed) {
      const community = await findCommunityById(post.community_id);
      const membership = community ? await findMembership(community.id, userId) : null;
      allowed = isOwnerOrModerator(membership);
    }
    if (!allowed) return res.status(403).json({ error: 'Only the post author or a community moderator can do this' });

    await softDeletePost(post.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function listCommunityPosts(req, res) {
  try {
    const community = await findActiveCommunityByName(req.params.name);
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const posts = await listActivePostsByCommunity(community.id, req.query.sort);
    res.status(200).json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function getHomeFeed(req, res) {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(400).json({ error: 'userId query param is required' });

    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const communityIds = await listJoinedCommunityIds(userId);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);

    const posts = communityIds.length
      ? await listActivePostsByCommunityIds(communityIds, req.query.sort, limit)
      : [];

    res.status(200).json({ posts });
  } catch (err) {
    console.error(err);
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
