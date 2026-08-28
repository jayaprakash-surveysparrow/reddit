const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../db/sequelize');

const CommunityMember = sequelize.define(
  'CommunityMember',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
    },
    community_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'member',
    },
    joined_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('now()'),
    },
  },
  {
    tableName: 'community_members',
    timestamps: false,
  }
);

module.exports = CommunityMember;
