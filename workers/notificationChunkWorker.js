const {Worker} = require('bullmq');
const connection = require('../db/redisQueueConnection');
const {NOTIFICATION_CHUNK_QUEUE_NAME, notificationChunkQueue} = require('../queues/notificationChunkQueue');
const {transporter, MAIL_FROM} = require('../mail/transporter');
const logger = require('../utils/logger');
const {hasBeenSent, markAsSent} = require('../repositories/notificationSend');

const MAX_RECIPIENT_RETRIES = 3;

async function processNotificationChunkJob(job) {
    const {postId, title, communityName, authorUsername, recipients} = job.data;
    let sent = 0;
    let failed = 0;
    for(const r of recipients) {
        const alreadySent = await hasBeenSent(postId, r.id);
        if (alreadySent) {
            sent++;
            continue;
        }

        try {
            await transporter.sendMail({
                from: MAIL_FROM,
                to: r.email,
                subject: `New post in r/${communityName}: "${title}"`,
                text: `Hi ${r.username},\n\n${authorUsername || 'A user'} just posted in r/${communityName}:\n\n"${title}"\n\nYou're receiving this email because you're a member of r/${communityName}.`
            });
            await markAsSent(postId, r.id);
            sent++;
        }
        catch(err){
            failed++;
            logger.error(`Failed to send notification email to ${r.email}`, {error: err.message});

            const retryCount = (r.retryCount || 0) + 1;
            if (retryCount <= MAX_RECIPIENT_RETRIES) {
                await notificationChunkQueue.add(
                    'post-notification-retry',
                    { postId, title, communityName, authorUsername, recipients: [{ ...r, retryCount }] },
                    { delay: retryCount * 5000 }
                );
            } else {
                logger.error(`Giving up on notifying ${r.email} after ${MAX_RECIPIENT_RETRIES} retries`, { postId });
            }
        }
    }

    if (sent === 0 && recipients.length > 0) {
        throw new Error(`All ${recipients.length} send(s) failed for post ${postId}`);
    }

    return {total: recipients.length, sent, failed};
}

const notificationChunkWorker = new Worker(NOTIFICATION_CHUNK_QUEUE_NAME,
    processNotificationChunkJob,
    {
        connection,
        concurrency: 5
    }
)

notificationChunkWorker.on('completed', (job) => {
    logger.info(`Notification job ${job.id} completed`, {
        postId: job.data.postId,
        title: job.data.title,
        communityName: job.data.communityName,
        authorUsername: job.data.authorUsername,
        recipients: job.data.recipients.length,
        result: job.returnvalue
    });
});

notificationChunkWorker.on('failed', (job, err) => {
    logger.error(
        `Notification job ${job?.id} failed after ${job?.attemptsMade ?? '?'} attempt(s): ${err.message}`,
        {stack: err.stack, jobData: job?.data}
    );
});

module.exports = notificationChunkWorker;