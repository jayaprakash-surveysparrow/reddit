const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../db/sequelize');

// Maps onto the users table created by db/schema.sql. Case-insensitive
// uniqueness on username/email is enforced there via functional indexes on
// LOWER(...) — the DB is the source of truth for schema/constraints, not
// Sequelize's sync(), so that's intentionally not redeclared here.
const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: Sequelize.literal('gen_random_uuid()'),
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    karma: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('now()'),
    },
    
  },
  {
    tableName: 'users',
    timestamps: false,
  }
);

module.exports = User;
