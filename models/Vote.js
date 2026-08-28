const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../db/sequelize');

// target_id has no association/FK: it polymorphically points at either
// posts or comments depending on target_type, which is validated at the
// repository/controller layer, not by Sequelize or the DB.
const Vote = sequelize.define(
  'Vote',
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
    target_type: {
      type: DataTypes.STRING(10),
      allowNull: false,
    },
    target_id: {
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
    tableName: 'votes',
    timestamps: false,
  }
);

module.exports = Vote;
