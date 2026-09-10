const { Worker } = require('bullmq');
const connection = require('../db/redisQueueConnection');
const { ACTIVITY_QUEUE_NAME } = require('../queues/activityQueue');
const opensearch = require('../db/opensearch');
const { ACTIVITY_EVENTS_INDEX } = require('../search/indexNames');
const logger = require('../utils/logger');

// Activity events are append-only facts ("this action happened at this
// time") — never updated or deleted, so unlike the search-index worker there
// is no upsert/delete branching here, just an insert. No explicit _id either:
// each vote/post/comment can produce many events over time, so OpenSearch
// auto-generating a unique id per event is correct, not an oversight.
async function processActivityJob(job) {
  const { type, userId, username, communityId, communityName, targetType, targetId, createdAt } = job.data;

  return opensearch.index({
    index: ACTIVITY_EVENTS_INDEX,
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
