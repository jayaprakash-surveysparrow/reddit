const { CommunityMember, User } = require('../models');

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
  await CommunityMember.destroy({ where: { community_id: communityId, user_id: userId }, transaction });
}

async function listMembersWithUsers(communityId) {
  const memberships = await CommunityMember.findAll({
    where: { community_id: communityId },
    include: [{ model: User, attributes: ['id', 'username'] }],
    order: [['joined_at', 'ASC']],
  });

  return memberships.map((m) => ({
    id: m.User.id,
    username: m.User.username,
    role: m.role,
    joined_at: m.joined_at,
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
};
