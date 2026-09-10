const { Op } = require('sequelize');
const sequelize = require('../db/sequelize');
const User = require('../models/User');

function lowerEquals(column, value) {
  return sequelize.where(sequelize.fn('lower', sequelize.col(column)), value.toLowerCase());
}

async function findUserById(id, transaction) {
  const user = await User.findByPk(id, { transaction });
  return user ? user.get({ plain: true }) : null;
}

async function findUserByUsernameOrEmail(identifier) {
  const user = await User.findOne({
    where: { [Op.or]: [lowerEquals('username', identifier), lowerEquals('email', identifier)] },
  });
  return user ? user.get({ plain: true }) : null;
}

async function findUserByUsername(username) {
  const user = await User.findOne({ where: lowerEquals('username', username) });
  return user ? user.get({ plain: true }) : null;
}

async function findUserByEmail(email) {
  const user = await User.findOne({ where: lowerEquals('email', email) });
  return user ? user.get({ plain: true }) : null;
}

async function createUser({ username, email, passwordHash }) {
  const user = await User.create({ username, email, password_hash: passwordHash });
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    karma: user.karma,
    created_at: user.created_at,
  };
}

async function updateUserFields(id, fields, transaction) {
  await User.update(fields, { where: { id }, transaction, individualHooks: true });
}

async function updatePasswordHash(userId, passwordHash, transaction) {
  await User.update(
    { password_hash: passwordHash },
    { where: { id: userId }, transaction, individualHooks: true }
  );
}

async function listAllUsersForIndexing(limit, offset) {
  const users = await User.findAll({
    order: [['created_at', 'ASC']],
    limit,
    offset,
  });
  return users.map((u) => u.get({ plain: true }));
}

module.exports = {
  findUserById,
  findUserByUsernameOrEmail,
  findUserByUsername,
  findUserByEmail,
  createUser,
  updateUserFields,
  updatePasswordHash,
  listAllUsersForIndexing,
};
