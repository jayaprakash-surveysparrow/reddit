const NotificationSend = require('../models/NotificationSend');

async function hasBeenSent(postId, recipientId) {
    const result = await NotificationSend.findOne({
        where: {
            post_id: postId,
            recipient_id: recipientId
        }
    });

    return !!result;
}

async function markAsSent(postId, recipientId) {
    try {
        await NotificationSend.create({
            post_id: postId,
            recipient_id: recipientId
        });
        return true;
    }
    catch (err) {
        if(err.name === 'SequelizeUniqueConstraintError') {
            // The notification has already been sent, so we can ignore this error
            return false;
        }
        throw err;
    }
}

module.exports = {
    hasBeenSent,
    markAsSent
};