const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../db/sequelize');

const PostVote = sequelize.define(
  'PostVote',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    post_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    value: {
      type: DataTypes.SMALLINT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('now()'),
    },
  },
  {
    tableName: 'post_votes',
    timestamps: false,
  }
);

module.exports = PostVote;
