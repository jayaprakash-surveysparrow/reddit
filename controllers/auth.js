const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { toPublicUser } = require('../utils/serializers');
const { hashToken } = require('../utils/tokens');
const { signAccessToken, signRefreshToken, verifyRefreshToken, REFRESH_TOKEN_TTL_MS } = require('../utils/jwt');
const sequelize = require('../db/sequelize');
const {
  findUserById,
  findUserByUsername,
  findUserByEmail,
  findUserByUsernameOrEmail,
  createUser,
  updatePasswordHash,
} = require('../repositories/user');
const {
  invalidateUserTokens,
  createResetToken,
  findValidTokenByHash,
  markTokenUsed,
} = require('../repositories/passwordReset');
const {
  createRefreshToken,
  findValidRefreshToken,
  revokeRefreshTokenById,
  revokeRefreshTokenByHash,
} = require('../repositories/refreshToken');

const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;

async function issueTokenPair(user, transaction) {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);

  await createRefreshToken(user.id, hashToken(refreshToken), expiresAt, transaction);

  return { accessToken, refreshToken };
}

async function signup(req, res) {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: 'username, email and password are required' });
  }

  try {
    const usernameTaken = await findUserByUsername(username);
    if (usernameTaken) return res.status(409).json({ error: 'Username is already taken' });

    const emailTaken = await findUserByEmail(email);
    if (emailTaken) return res.status(409).json({ error: 'Email is already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await createUser({ username, email, passwordHash });
    const tokens = await issueTokenPair(user);

    res.status(201).json({ user, ...tokens });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function login(req, res) {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }

  try {
    const user = await findUserByUsernameOrEmail(username);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const passwordMatches = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatches) return res.status(401).json({ error: 'Invalid credentials' });

    const tokens = await issueTokenPair(user);
    res.status(200).json({ user: toPublicUser(user), ...tokens });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function forgotPassword(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'email is required' });

  const genericMessage = 'If that email is registered, a reset token has been issued.';

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(200).json({ message: genericMessage });

    const rawToken = crypto.randomBytes(32).toString('hex');
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await sequelize.transaction(async (t) => {
      await invalidateUserTokens(user.id, t);
      await createResetToken(user.id, tokenHash, expiresAt, t);
    });
  
    res.status(200).json({ message: genericMessage, resetToken: rawToken, expiresAt });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function resetPassword(req, res) {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'token and newPassword are required' });
  }

  try {
    const tokenHash = hashToken(token);
    const passwordHash = await bcrypt.hash(newPassword, 10);

    const spentToken = await sequelize.transaction(async (t) => {
      const found = await findValidTokenByHash(tokenHash, t);
      if (!found) return null;

      await updatePasswordHash(found.user_id, passwordHash, t);
      await markTokenUsed(found.id, t);
      return found;
    });

    if (!spentToken) return res.status(400).json({ error: 'Invalid or expired reset token' });

    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function refreshAccessToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken is required' });

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  try {
    const tokenHash = hashToken(refreshToken);

    const tokens = await sequelize.transaction(async (t) => {
      const record = await findValidRefreshToken(tokenHash, t);
      if (!record) return null;

      const user = await findUserById(payload.sub, t);
      if (!user) return null;

      await revokeRefreshTokenById(record.id, t);
      return issueTokenPair(user, t);
    });

    if (!tokens) return res.status(401).json({ error: 'Refresh token is invalid, expired, or revoked' });

    res.status(200).json(tokens);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function logout(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ error: 'refreshToken is required' });

  try {
    const tokenHash = hashToken(refreshToken);
    const affected = await revokeRefreshTokenByHash(tokenHash);
    if (!affected) return res.status(404).json({ error: 'Refresh token not found or already revoked' });

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = { signup, login, forgotPassword, resetPassword, refreshAccessToken, logout };
