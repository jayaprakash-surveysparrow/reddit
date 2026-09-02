const logger = require('../utils/logger');
const bcrypt = require('bcryptjs');

const { toPublicUser } = require('../utils/serializers');
const { parsePagination } = require('../utils/pagination');
const { findUserByUsername, findUserByEmail, findUserById, updateUserFields } = require('../repositories/user');
const { listActivePostsByAuthor } = require('../repositories/post');
const { listActiveCommentsByAuthor } = require('../repositories/comment');
const { invalidateUserProfile } = require('../cache/invalidate');

async function getUserProfile(req, res) {
  try {
    const user = await findUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(toPublicUser(user));
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

function getCurrentUser(req, res) {
  res.status(200).json(req.user);
}

async function updateCurrentUser(req, res) {
  try {
    const { username, email, password } = req.body;
    const user = req.user;

    const fields = {};

    if (username && username.toLowerCase() !== user.username.toLowerCase()) {
      const existing = await findUserByUsername(username);
      if (existing && existing.id !== user.id) return res.status(409).json({ error: 'Username is already taken' });
      fields.username = username;
    }

    if (email && email.toLowerCase() !== user.email.toLowerCase()) {
      const existing = await findUserByEmail(email);
      if (existing && existing.id !== user.id) return res.status(409).json({ error: 'Email is already registered' });
      fields.email = email;
    }

    if (password) fields.password_hash = await bcrypt.hash(password, 10);

    if (Object.keys(fields).length > 0) {
      await updateUserFields(user.id, fields);
      // req.user.username is the pre-update value — exactly the key
      // currently cached, regardless of whether username itself changed.
      await invalidateUserProfile(user.username);
    }

    const updated = await findUserById(user.id);
    res.status(200).json(toPublicUser(updated));
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function getUserPosts(req, res) {
  try {
    const user = await findUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { limit, offset, page } = parsePagination(req.query);
    const posts = await listActivePostsByAuthor(user.id, limit, offset);
    res.status(200).json({ posts, page, limit });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function getUserComments(req, res) {
  try {
    const user = await findUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const { limit, offset, page } = parsePagination(req.query);
    const comments = await listActiveCommentsByAuthor(user.id, limit, offset);
    res.status(200).json({ comments, page, limit });
  } catch (err) {
    logger.error(err.message, { stack: err.stack });
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = {
  getUserProfile,
  getCurrentUser,
  updateCurrentUser,
  getUserPosts,
  getUserComments,
};
