const { Op } = require('sequelize');
const sequelize = require('../db/sequelize');
const { RefreshToken } = require('../models');

async function createRefreshToken(userId, tokenHash, expiresAt, transaction) {
  const token = await RefreshToken.create(
    { user_id: userId, token_hash: tokenHash, expires_at: expiresAt },
    { transaction }
  );
  return token.get({ plain: true });
}

// Must be called with an active transaction: the row lock (FOR UPDATE) it
// takes only holds for the lifetime of that transaction, which is what makes
// concurrent use of the same refresh token safe.
async function findValidRefreshToken(tokenHash, transaction) {
  const token = await RefreshToken.findOne({
    where: {
      token_hash: tokenHash,
      revoked_at: null,
      expires_at: { [Op.gt]: sequelize.literal('now()') },
    },
    lock: transaction.LOCK.UPDATE,
    transaction,
  });
  return token ? token.get({ plain: true }) : null;
}

async function revokeRefreshTokenById(id, transaction) {
  await RefreshToken.update({ revoked_at: sequelize.literal('now()') }, { where: { id }, transaction });
}

async function revokeRefreshTokenByHash(tokenHash, transaction) {
  const [affected] = await RefreshToken.update(
    { revoked_at: sequelize.literal('now()') },
    { where: { token_hash: tokenHash, revoked_at: null }, transaction }
  );
  return affected;
}

module.exports = {
  createRefreshToken,
  findValidRefreshToken,
  revokeRefreshTokenById,
  revokeRefreshTokenByHash,
};
