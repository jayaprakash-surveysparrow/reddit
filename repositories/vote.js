const sequelize = require('../db/sequelize');
const { Vote } = require('../models');

async function findVote(userId, targetType, targetId, transaction) {
  const vote = await Vote.findOne({
    where: { user_id: userId, target_type: targetType, target_id: targetId },
    transaction,
  });
  return vote ? vote.get({ plain: true }) : null;
}

async function createVote(data, transaction) {
  const vote = await Vote.create(data, { transaction });
  return vote.get({ plain: true });
}

async function updateVoteValue(id, value, transaction) {
  await Vote.update({ value, created_at: sequelize.literal('now()') }, { where: { id }, transaction });
}

async function deleteVote(id, transaction) {
  await Vote.destroy({ where: { id }, transaction });
}

module.exports = { findVote, createVote, updateVoteValue, deleteVote };
