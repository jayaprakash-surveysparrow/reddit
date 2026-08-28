const { DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../db/sequelize');

const PasswordResetToken = sequelize.define(
  'PasswordResetToken',
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
    token_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('now()'),
    },
  },
  {
    tableName: 'password_reset_tokens',
    timestamps: false,
  }
);

module.exports = PasswordResetToken;
