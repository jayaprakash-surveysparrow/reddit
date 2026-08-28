const User = require('./User');
const PasswordResetToken = require('./PasswordResetToken');
const RefreshToken = require('./RefreshToken');
const Community = require('./Community');
const CommunityMember = require('./CommunityMember');
const Post = require('./Post');
const Comment = require('./Comment');
const Vote = require('./Vote');

CommunityMember.belongsTo(User, { foreignKey: 'user_id' });
CommunityMember.belongsTo(Community, { foreignKey: 'community_id' });

module.exports = {
  User,
  PasswordResetToken,
  RefreshToken,
  Community,
  CommunityMember,
  Post,
  Comment,
  Vote,
};
