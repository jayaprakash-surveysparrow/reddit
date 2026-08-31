const sequelize = require('../db/sequelize');
const { COMMUNITY_NAME_PATTERN } = require('../utils/validators');
const { isOwner } = require('../utils/permissions');
const {
  findActiveCommunityByName,
  isActiveNameTaken,
  createCommunity: createCommunityRow,
  updateCommunityFields,
  softDeleteCommunity,
  incrementMemberCount,
  listActiveCommunities,
} = require('../repositories/community');
const {
  findMembership,
  addMembership,
  removeMembership,
  listMembersWithUsers,
} = require('../repositories/communityMember');

async function createCommunity(req, res) {
  const { name, description } = req.body;
  if (!name || !COMMUNITY_NAME_PATTERN.test(name)) {
    return res.status(400).json({ error: 'name is required and must be 3-21 alphanumeric/underscore characters' });
  }

  try {
    const nameTaken = await isActiveNameTaken(name);
    if (nameTaken) return res.status(409).json({ error: 'Community name is already taken' });

    const community = await sequelize.transaction(async (t) => {
      const created = await createCommunityRow({ name, description, createdBy: req.user.id }, t);
      await addMembership(created.id, req.user.id, 'owner', t);
      return created;
    });

    res.status(201).json(community);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function listCommunities(req, res) {
  try {
    const communities = await listActiveCommunities(req.query.q);
    res.status(200).json({ communities });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function getCommunity(req, res) {
  try {
    const community = await findActiveCommunityByName(req.params.name);
    if (!community) return res.status(404).json({ error: 'Community not found' });
    res.status(200).json(community);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function updateCommunity(req, res) {
  try {
    const community = await findActiveCommunityByName(req.params.name);
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const { name, description } = req.body;

    const membership = await findMembership(community.id, req.user.id);
    if (!isOwner(membership)) return res.status(403).json({ error: 'Only the community owner can do this' });

    const fields = {};
    if (name && name.toLowerCase() !== community.name.toLowerCase()) {
      if (!COMMUNITY_NAME_PATTERN.test(name)) {
        return res.status(400).json({ error: 'name must be 3-21 alphanumeric/underscore characters' });
      }
      const taken = await isActiveNameTaken(name, community.id);
      if (taken) return res.status(409).json({ error: 'Community name is already taken' });
      fields.name = name;
    }
    if (description !== undefined) fields.description = description;

    if (Object.keys(fields).length > 0) {
      await updateCommunityFields(community.id, fields);
    }

    const updated = await findActiveCommunityByName(fields.name || community.name);
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function deleteCommunity(req, res) {
  try {
    const community = await findActiveCommunityByName(req.params.name);
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const membership = await findMembership(community.id, req.user.id);
    if (!isOwner(membership)) return res.status(403).json({ error: 'Only the community owner can do this' });

    await softDeleteCommunity(community.id);
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function joinCommunity(req, res) {
  try {
    const community = await findActiveCommunityByName(req.params.name);
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const existing = await findMembership(community.id, req.user.id);
    if (existing) return res.status(409).json({ error: 'You are already a member of this community' });

    await sequelize.transaction(async (t) => {
      await addMembership(community.id, req.user.id, 'member', t);
      await incrementMemberCount(community.id, 1, t);
    });

    const updated = await findActiveCommunityByName(community.name);
    res.status(200).json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function leaveCommunity(req, res) {
  try {
    const community = await findActiveCommunityByName(req.params.name);
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const membership = await findMembership(community.id, req.user.id);
    if (isOwner(membership)) {
      return res.status(400).json({ error: 'The owner cannot leave the community; delete it instead' });
    }
    if (!membership) return res.status(409).json({ error: 'You are not a member of this community' });

    await sequelize.transaction(async (t) => {
      await removeMembership(community.id, req.user.id, t);
      await incrementMemberCount(community.id, -1, t);
    });

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

async function listMembers(req, res) {
  try {
    const community = await findActiveCommunityByName(req.params.name);
    if (!community) return res.status(404).json({ error: 'Community not found' });

    const members = await listMembersWithUsers(community.id);
    res.status(200).json({ members });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
}

module.exports = {
  createCommunity,
  listCommunities,
  getCommunity,
  updateCommunity,
  deleteCommunity,
  joinCommunity,
  leaveCommunity,
  listMembers,
};
