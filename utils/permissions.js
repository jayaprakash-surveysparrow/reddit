// Takes a membership row (or null) rather than looking it up itself —
// looking one up now means a DB round trip, so callers fetch it via
// repositories/communityMember.js first and pass the result in here.
function isOwner(membership) {
  return !!membership && membership.role === 'owner';
}

function isOwnerOrModerator(membership) {
  return !!membership && (membership.role === 'owner' || membership.role === 'moderator');
}

module.exports = { isOwner, isOwnerOrModerator };
