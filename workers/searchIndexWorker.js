const { Worker } = require('bullmq');
const connection = require('../db/redisQueueConnection');
const { SEARCH_INDEX_QUEUE_NAME } = require('../queues/searchIndexQueue');
const opensearch = require('../db/opensearch');
const { POSTS_INDEX, COMMUNITIES_INDEX, COMMENTS_INDEX, PROFILES_INDEX } = require('../search/indexNames');
const { postToDocument, communityToDocument, commentToDocument, profileToDocument } = require('../search/documents');
const { findActivePostById } = require('../repositories/post');
const { findActiveCommunityById } = require('../repositories/community');
const { findCommentById } = require('../repositories/comment');
const { findUserById } = require('../repositories/user');
const logger = require('../utils/logger');

function ignoreNotFound(err) {
  if (err.meta && err.meta.statusCode === 404) return;
  throw err;
}

async function processSearchIndexJob(job) {
  const { entity, action, id } = job.data;

  if (entity === 'post') {
    if (action === 'delete') return opensearch.delete({ index: POSTS_INDEX, id }).catch(ignoreNotFound);

    const post = await findActivePostById(id);
    if (!post) return opensearch.delete({ index: POSTS_INDEX, id }).catch(ignoreNotFound);

    return opensearch.index({ index: POSTS_INDEX, id: post.id, body: postToDocument(post) });
  }

  if (entity === 'community') {
    if (action === 'delete') return opensearch.delete({ index: COMMUNITIES_INDEX, id }).catch(ignoreNotFound);

    const community = await findActiveCommunityById(id);
    if (!community) return opensearch.delete({ index: COMMUNITIES_INDEX, id }).catch(ignoreNotFound);

    return opensearch.index({ index: COMMUNITIES_INDEX, id: community.id, body: communityToDocument(community) });
  }

  if (entity === 'comment') {
    if (action === 'delete') return opensearch.delete({ index: COMMENTS_INDEX, id }).catch(ignoreNotFound);

    // findCommentById deliberately keeps soft-deleted comments (comment tree
    // needs them for reply threads) — search shouldn't surface those, so a
    // soft-deleted comment is treated the same as "not found" here.
    const comment = await findCommentById(id);
    if (!comment || comment.deleted_at) return opensearch.delete({ index: COMMENTS_INDEX, id }).catch(ignoreNotFound);

    return opensearch.index({ index: COMMENTS_INDEX, id: comment.id, body: commentToDocument(comment) });
  }

  if (entity === 'profile') {
    if (action === 'delete') return opensearch.delete({ index: PROFILES_INDEX, id }).catch(ignoreNotFound);

    const user = await findUserById(id);
    if (!user) return opensearch.delete({ index: PROFILES_INDEX, id }).catch(ignoreNotFound);

    return opensearch.index({ index: PROFILES_INDEX, id: user.id, body: profileToDocument(user) });
  }

  logger.warn(`Unknown entity type in search index job: ${entity}`);
}

const worker = new Worker(SEARCH_INDEX_QUEUE_NAME, processSearchIndexJob, {
  connection,
  concurrency: 5,
});

worker.on('completed', (job) => {
  logger.info(`Search index job ${job.id} completed`, {
    entity: job.data.entity,
    action: job.data.action,
    id: job.data.id,
  });
});

worker.on('failed', (job, err) => {
  logger.error(
    `Search index job ${job?.id} failed after ${job?.attemptsMade ?? '?'} attempt(s): ${err.message}`,
    { stack: err.stack, jobData: job?.data }
  );
});

module.exports = worker;