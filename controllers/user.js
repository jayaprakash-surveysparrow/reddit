const bcrypt = require('bcryptjs');

const { toPublicUser } = require('../utils/serializers');
const { findUserByUsername, findUserByEmail, findUserById, updateUserFields } = require('../repositories/user');
const { listActivePostsByAuthor } = require('../repositories/post');
const { listActiveCommentsByAuthor } = require('../repositories/comment');

async function getUserProfile(req, res) {
  try {
    const user = await findUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.status(200).json(toPublicUser(user));
  } catch (err) {
    console.error(err);
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
    }

    const updated = await findUserById(user.id);
    res.status(200).json(toPublicUser(updated));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function getUserPosts(req, res) {
  try {
    const user = await findUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const posts = await listActivePostsByAuthor(user.id);
    res.status(200).json({ posts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function getUserComments(req, res) {
  try {
    const user = await findUserByUsername(req.params.username);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const comments = await listActiveCommentsByAuthor(user.id);
    res.status(200).json({ comments });
  } catch (err) {
    console.error(err);
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
