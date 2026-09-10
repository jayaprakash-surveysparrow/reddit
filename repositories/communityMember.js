const { CommunityMember, User } = require('../models');
const {Op} = require('sequelize');

async function findMembership(communityId, userId, transaction) {
  const membership = await CommunityMember.findOne({
    where: { community_id: communityId, user_id: userId },
    transaction,
  });
  return membership ? membership.get({ plain: true }) : null;
}

async function addMembership(communityId, userId, role, transaction) {
  const membership = await CommunityMember.create(
    { community_id: communityId, user_id: userId, role },
    { transaction }
  );
  return membership.get({ plain: true });
}

async function removeMembership(communityId, userId, transaction) {
  await CommunityMember.destroy({
    where: { community_id: communityId, user_id: userId },
    transaction,
    individualHooks: true,
  });
}

async function listMembersWithUsers(communityId, limit, offset) {
  const memberships = await CommunityMember.findAll({
    where: { community_id: communityId },
    include: [{ model: User, attributes: ['id', 'username'] }],
    order: [['joined_at', 'ASC']],
    limit,
    offset,
  });

  return memberships.map((m) => ({
    id: m.User.id,
    username: m.User.username,
    role: m.role,
    joined_at: m.joined_at,
  }));
}

async function listMemberEmailsByCommunity(communityId, excludeUserId, limit, offset) {
  const otherMembers = await CommunityMember.findAll({
    include: [{ model: User, attributes: ['id', 'username', 'email']}],
    where: {
      community_id: communityId,
      user_id: {
        [Op.ne]: excludeUserId
      }
    },
    order: [['id', 'ASC']],
    limit,
    offset
  });

  return otherMembers.map((m) => ({
    id: m.User.id,
    username: m.User.username,
    email: m.User.email
  }));
}

async function listJoinedCommunityIds(userId) {
  const memberships = await CommunityMember.findAll({
    where: { user_id: userId },
    attributes: ['community_id'],
  });
  return memberships.map((m) => m.community_id);
}

module.exports = {
  findMembership,
  addMembership,
  removeMembership,
  listMembersWithUsers,
  listJoinedCommunityIds,
  listMemberEmailsByCommunity
};
