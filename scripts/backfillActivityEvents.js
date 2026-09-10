require('dotenv').config();
const opensearch = require('../db/opensearch');
const { ACTIVITY_EVENTS_INDEX } = require('../search/indexNames');
const { listAllActivePostsForIndexing } = require('../repositories/post');
const { listAllActiveCommentsForIndexing } = require('../repositories/comment');
const { PostVote, CommentVote, User } = require('../models');

const BATCH_SIZE = 500;

// Deterministic _id per event means this script is safe to re-run — a
// second run overwrites the same documents instead of duplicating every
// historical action and inflating all the aggregation counts.
async function bulkIndexEvents(items) {
    if (items.length === 0) return 0;
    const body = items.flatMap(({ id, doc }) => [{ index: { _index: ACTIVITY_EVENTS_INDEX, _id: id } }, doc]);
    await opensearch.bulk({ body });
    return items.length;
}

async function backfillPostCreatedEvents() {
    const postCommunityMap = new Map(); // post_id -> { community_id, community_name }
    let offset = 0;
    let total = 0;

    while (true) {
        const posts = await listAllActivePostsForIndexing(BATCH_SIZE, offset);
        if (posts.length === 0) break;

        const items = posts.map((post) => {
            postCommunityMap.set(post.id, { community_id: post.community_id, community_name: post.community_name });
            return {
                id: `backfill:post_created:${post.id}`,
                doc: {
                    type: 'post_created',
                    user_id: post.author_id,
                    username: post.author_username,
                    community_id: post.community_id,
                    community_name: post.community_name,
                    target_type: 'post',
                    target_id: post.id,
                    created_at: post.created_at,
                },
            };
        });

        total += await bulkIndexEvents(items);
        offset += BATCH_SIZE;
        if (posts.length < BATCH_SIZE) break;
    }

    console.log(`Backfilled ${total} post_created events`);
    return postCommunityMap;
}

async function backfillCommentCreatedEvents(postCommunityMap) {
    const commentPostMap = new Map(); // comment_id -> post_id
    let offset = 0;
    let total = 0;

    while (true) {
        const comments = await listAllActiveCommentsForIndexing(BATCH_SIZE, offset);
        if (comments.length === 0) break;

        const items = comments.map((comment) => {
            commentPostMap.set(comment.id, comment.post_id);
            const context = postCommunityMap.get(comment.post_id) || { community_id: null, community_name: null };
            return {
                id: `backfill:comment_created:${comment.id}`,
                doc: {
                    type: 'comment_created',
                    user_id: comment.author_id,
                    username: comment.author_username,
                    community_id: context.community_id,
                    community_name: context.community_name,
                    target_type: 'comment',
                    target_id: comment.id,
                    created_at: comment.created_at,
                },
            };
        });

        total += await bulkIndexEvents(items);
        offset += BATCH_SIZE;
        if (comments.length < BATCH_SIZE) break;
    }

    console.log(`Backfilled ${total} comment_created events`);
    return commentPostMap;
}

// Postgres only keeps current vote state (one row per user+target, and
// updatePostVoteValue/updateCommentVoteValue bump created_at on every
// change) — not a full history of every vote action ever cast. So this can
// only synthesize ONE vote_cast event per existing vote row, reflecting its
// most recent change, not every intermediate vote flip. Disclosed
// simplification, same spirit as the rest of this backfill.
async function backfillPostVoteEvents(postCommunityMap) {
    const votes = await PostVote.findAll({ include: [{ model: User, attributes: ['username'] }] });
    const items = votes.map((v) => {
        const vote = v.get({ plain: true });
        const context = postCommunityMap.get(vote.post_id) || { community_id: null, community_name: null };
        return {
            id: `backfill:vote_cast:${vote.id}`,
            doc: {
                type: 'vote_cast',
                user_id: vote.user_id,
                username: vote.User ? vote.User.username : null,
                community_id: context.community_id,
                community_name: context.community_name,
                target_type: 'post',
                target_id: vote.post_id,
                created_at: vote.created_at,
            },
        };
    });
    const total = await bulkIndexEvents(items);
    console.log(`Backfilled ${total} post vote_cast events`);
}

async function backfillCommentVoteEvents(commentPostMap, postCommunityMap) {
    const votes = await CommentVote.findAll({ include: [{ model: User, attributes: ['username'] }] });
    const items = votes.map((v) => {
        const vote = v.get({ plain: true });
        const postId = commentPostMap.get(vote.comment_id);
        const context = (postId && postCommunityMap.get(postId)) || { community_id: null, community_name: null };
        return {
            id: `backfill:vote_cast:${vote.id}`,
            doc: {
                type: 'vote_cast',
                user_id: vote.user_id,
                username: vote.User ? vote.User.username : null,
                community_id: context.community_id,
                community_name: context.community_name,
                target_type: 'comment',
                target_id: vote.comment_id,
                created_at: vote.created_at,
            },
        };
    });
    const total = await bulkIndexEvents(items);
    console.log(`Backfilled ${total} comment vote_cast events`);
}

async function main() {
    const postCommunityMap = await backfillPostCreatedEvents();
    const commentPostMap = await backfillCommentCreatedEvents(postCommunityMap);
    await backfillPostVoteEvents(postCommunityMap);
    await backfillCommentVoteEvents(commentPostMap, postCommunityMap);
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
