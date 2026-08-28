const { Op } = require('sequelize');
const sequelize = require('../db/sequelize');
const PasswordResetToken = require('../models/PasswordResetToken');

async function invalidateUserTokens(userId, transaction) {
  await PasswordResetToken.update(
    { used_at: sequelize.literal('now()') },
    { where: { user_id: userId, used_at: null }, transaction }
  );
}

async function createResetToken(userId, tokenHash, expiresAt, transaction) {
  const token = await PasswordResetToken.create(
    { user_id: userId, token_hash: tokenHash, expires_at: expiresAt },
    { transaction }
  );
  return token.get({ plain: true });
}

// Must be called with an active transaction: the row lock (FOR UPDATE) it
// takes only holds for the lifetime of that transaction, which is what makes
// concurrent use of the same token safe.
async function findValidTokenByHash(tokenHash, transaction) {
  const token = await PasswordResetToken.findOne({
    where: {
      token_hash: tokenHash,
      used_at: null,
      expires_at: { [Op.gt]: sequelize.literal('now()') },
    },
    lock: transaction.LOCK.UPDATE,
    transaction,
  });
  return token ? token.get({ plain: true }) : null;
}

async function markTokenUsed(tokenId, transaction) {
  await PasswordResetToken.update({ used_at: sequelize.literal('now()') }, { where: { id: tokenId }, transaction });
}

module.exports = {
  invalidateUserTokens,
  createResetToken,
  findValidTokenByHash,
  markTokenUsed,
};
