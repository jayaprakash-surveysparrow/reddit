const {Worker} = require('bullmq');
const connection = require('../db/redisQueueConnection');
const {NOTIFICATION_QUEUE_NAME} = require('../queues/notificationQueue');
const {findActivePostById} = require('../repositories/post');
const {listMemberEmailsByCommunity} = require('../repositories/communityMember');
const logger = require('../utils/logger');
const {notificationChunkQueue} = require('../queues/notificationChunkQueue');

async function processNotificationJob(job) {
    const {postId, communityId, authorId} = job.data;
    const post = await findActivePostById(postId);
    if(!post){
        logger.warn(`Post ${postId} no longer exists, skipping notification job`);
        return;
    }
    const CHUNK_SIZE = 500;
    let offset = job.progress || 0;
    let totalChunks = 0;
    let totalRecipients = 0;

    while(true){
        const page = await listMemberEmailsByCommunity(communityId, authorId, CHUNK_SIZE, offset);
        if(page.length === 0) break;

        await notificationChunkQueue.add('post-notification-chunk', {
            postId: post.id,
            title: post.title,
            communityName: post.community_name,
            authorUsername: post.author_username,
            recipients: page,
        });

        totalChunks++;
        totalRecipients += page.length;
        offset += CHUNK_SIZE;

        await job.updateProgress(offset);

        if(page.length < CHUNK_SIZE) break;
    }
    return {totalChunks, totalRecipients};
}

const worker = new Worker(
    NOTIFICATION_QUEUE_NAME, 
    processNotificationJob, 
    {  
        connection, 
        concurrency: 5
    }
);

worker.on('completed', (job) => {
    logger.info(`Notification job ${job.id} completed`, {
        postId: job.data.postId,
        communityId: job.data.communityId,
        authorId: job.data.authorId,
        result: job.returnvalue
    });
});

worker.on('failed', (job, err) => {
    logger.error(
        `Notification job ${job?.id} failed after ${job?.attemptsMade ?? '?'} attempt(s): ${err.message}`,
        {stack: err.stack, jobData: job?.data}
    );
});

module.exports = worker;