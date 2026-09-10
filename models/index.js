const sequelize = require('../db/sequelize');
const { registerAuditHooks } = require('../db/auditHooks');

const User = require('./User');
const PasswordResetToken = require('./PasswordResetToken');
const RefreshToken = require('./RefreshToken');
const Community = require('./Community');
const CommunityMember = require('./CommunityMember');
const Post = require('./Post');
const Comment = require('./Comment');
const PostVote = require('./PostVote');
const CommentVote = require('./CommentVote');
const AuditLog = require('./AuditLog');
const NotificationSend = require('./NotificationSend');

CommunityMember.belongsTo(User, { foreignKey: 'user_id' });
CommunityMember.belongsTo(Community, { foreignKey: 'community_id' });
User.hasMany(CommunityMember, { foreignKey: 'user_id' });
Community.hasMany(CommunityMember, { foreignKey: 'community_id' });

Community.belongsTo(User, { foreignKey: 'created_by', as: 'creator' });
Community.hasMany(Post, { foreignKey: 'community_id' });
Post.belongsTo(Community, { foreignKey: 'community_id', as: 'community' });

User.hasMany(Post, { foreignKey: 'author_id' });
Post.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

Post.hasMany(Comment, { foreignKey: 'post_id' });
Comment.belongsTo(Post, { foreignKey: 'post_id' });

User.hasMany(Comment, { foreignKey: 'author_id' });
Comment.belongsTo(User, { foreignKey: 'author_id', as: 'author' });

Comment.hasMany(Comment, { foreignKey: 'parent_comment_id', as: 'replies' });
Comment.belongsTo(Comment, { foreignKey: 'parent_comment_id', as: 'parent' });

User.hasMany(PostVote, { foreignKey: 'user_id' });
PostVote.belongsTo(User, { foreignKey: 'user_id' });
Post.hasMany(PostVote, { foreignKey: 'post_id' });
PostVote.belongsTo(Post, { foreignKey: 'post_id' });

User.hasMany(CommentVote, { foreignKey: 'user_id' });
CommentVote.belongsTo(User, { foreignKey: 'user_id' });
Comment.hasMany(CommentVote, { foreignKey: 'comment_id' });
CommentVote.belongsTo(Comment, { foreignKey: 'comment_id' });

registerAuditHooks(sequelize, AuditLog);

module.exports = {
  User,
  PasswordResetToken,
  RefreshToken,
  Community,
  CommunityMember,
  Post,
  Comment,
  PostVote,
  CommentVote,
  AuditLog,
  NotificationSend
};
