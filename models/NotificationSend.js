const {DataTypes, Sequelize} = require('sequelize');
const sequelize = require('../db/sequelize');

const NotificationSend = sequelize.define('NotificationSend', {
    post_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
    },
    recipient_id: {
        type: DataTypes.UUID,
        allowNull: false,
        primaryKey: true,
    },
    sent_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('now()'),
    },
}, {
    tableName: 'notification_sends',
    timestamps: false,
});

module.exports = NotificationSend;