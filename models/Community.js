const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../db/sequelize');

// Case-insensitive uniqueness among non-deleted communities is enforced by
// the partial index in db/schema.sql, not by Sequelize.
const Community = sequelize.define(
  'Community',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
    },
    name: {
      type: DataTypes.STRING(21),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    member_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('now()'),
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'communities',
    timestamps: false,
  }
);

module.exports = Community;
