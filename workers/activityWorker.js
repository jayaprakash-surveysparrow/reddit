const { Worker } = require('bullmq');
const connection = require('../db/redisQueueConnection');
const { ACTIVITY_QUEUE_NAME } = require('../queues/activityQueue');
const opensearch = require('../db/opensearch');
const { ACTIVITY_EVENTS_INDEX } = require('../search/indexNames');
const logger = require('../utils/logger');

// Post/comment-created events are append-only facts and only ever happen
// once per target, so they get an auto-generated id (no `eventId` on the
// job). Vote-cast events carry a deterministic `eventId` (user+target pair)
// instead: a vote can be cast, removed, and re-cast many times, and each of
// those should upsert the same activity document rather than appending a
// new one — otherwise toggling one post's vote repeatedly would inflate
// that user's activity count far beyond the number of posts they voted on.
async function processActivityJob(job) {
  const { eventId, type, userId, username, communityId, communityName, targetType, targetId, createdAt } = job.data;

  return opensearch.index({
    index: ACTIVITY_EVENTS_INDEX,
    ...(eventId ? { id: eventId } : {}),
    body: {
      type,
      user_id: userId,
      username,
      community_id: communityId,
      community_name: communityName,
      target_type: targetType,
      target_id: targetId,
      created_at: createdAt,
    },
  });
}

const worker = new Worker(ACTIVITY_QUEUE_NAME, processActivityJob, {
  connection,
  concurrency: 5,
});

worker.on('completed', (job) => {
  logger.info(`Activity job ${job.id} completed`, { type: job.data.type, targetId: job.data.targetId });
});

worker.on('failed', (job, err) => {
  logger.error(
    `Activity job ${job?.id} failed after ${job?.attemptsMade ?? '?'} attempt(s): ${err.message}`,
    { stack: err.stack, jobData: job?.data }
  );
});

module.exports = worker;
