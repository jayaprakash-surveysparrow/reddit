const { Op } = require('sequelize');
const sequelize = require('../db/sequelize');
const { Community } = require('../models');

function lowerEquals(column, value) {
  return sequelize.where(sequelize.fn('lower', sequelize.col(column)), value.toLowerCase());
}

async function findActiveCommunityByName(name, transaction) {
  const community = await Community.findOne({
    where: { [Op.and]: [lowerEquals('name', name), { deleted_at: null }] },
    transaction,
  });
  return community ? community.get({ plain: true }) : null;
}

async function findCommunityById(id, transaction) {
  const community = await Community.findByPk(id, { transaction });
  return community ? community.get({ plain: true }) : null;
}

async function isActiveNameTaken(name, excludeId, transaction) {
  const clauses = [lowerEquals('name', name), { deleted_at: null }];
  if (excludeId) clauses.push({ id: { [Op.ne]: excludeId } });
  const community = await Community.findOne({ where: { [Op.and]: clauses }, transaction });
  return !!community;
}

async function createCommunity({ name, description, createdBy }, transaction) {
  const community = await Community.create(
    { name, description: description || '', created_by: createdBy, member_count: 1 },
    { transaction }
  );
  return community.get({ plain: true });
}

async function updateCommunityFields(id, fields, transaction) {
  await Community.update(fields, { where: { id }, transaction });
}

async function softDeleteCommunity(id, transaction) {
  await Community.update({ deleted_at: sequelize.literal('now()') }, { where: { id }, transaction });
}

async function incrementMemberCount(id, delta, transaction) {
  await Community.increment('member_count', { by: delta, where: { id }, transaction });
}

async function listActiveCommunities(nameQuery) {
  const where = nameQuery ? { deleted_at: null, name: { [Op.iLike]: `%${nameQuery}%` } } : { deleted_at: null };
  const communities = await Community.findAll({ where, order: [['member_count', 'DESC']] });
  return communities.map((c) => c.get({ plain: true }));
}

module.exports = {
  findActiveCommunityByName,
  findCommunityById,
  isActiveNameTaken,
  createCommunity,
  updateCommunityFields,
  softDeleteCommunity,
  incrementMemberCount,
  listActiveCommunities,
};
