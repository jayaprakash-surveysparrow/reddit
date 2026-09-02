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
// concurrent use of the same refresh token safe. A row's mere existence now
// means "still valid" — revocation and logout delete the row outright rather
// than marking it, so there's no separate revoked flag left to check here.
async function findValidRefreshToken(tokenHash, transaction) {
  const token = await RefreshToken.findOne({
    where: {
      token_hash: tokenHash,
      expires_at: { [Op.gt]: sequelize.literal('now()') },
    },
    lock: transaction.LOCK.UPDATE,
    transaction,
  });
  return token ? token.get({ plain: true }) : null;
}

async function deleteRefreshTokenById(id, transaction) {
  await RefreshToken.destroy({ where: { id }, transaction });
}

async function deleteRefreshTokenByHash(tokenHash, transaction) {
  const affected = await RefreshToken.destroy({ where: { token_hash: tokenHash }, transaction });
  return affected;
}

module.exports = {
  createRefreshToken,
  findValidRefreshToken,
  deleteRefreshTokenById,
  deleteRefreshTokenByHash,
};
