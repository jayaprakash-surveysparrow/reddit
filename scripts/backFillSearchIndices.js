require('dotenv').config();
const opensearch = require('../db/opensearch');
const { POSTS_INDEX, COMMUNITIES_INDEX, COMMENTS_INDEX, PROFILES_INDEX } = require('../search/indexNames');
const { postToDocument, communityToDocument, commentToDocument, profileToDocument } = require('../search/documents');
const { listAllActivePostsForIndexing } = require('../repositories/post');
const { listAllActiveCommunitiesForIndexing } = require('../repositories/community');
const { listAllActiveCommentsForIndexing } = require('../repositories/comment');
const { listAllUsersForIndexing } = require('../repositories/user');

const BATCH_SIZE = 500;

async function backfillPosts() {
  let offset = 0;
  let total = 0;
  while (true) {
    const posts = await listAllActivePostsForIndexing(BATCH_SIZE, offset);
    if (posts.length === 0) break;

    const body = posts.flatMap((post) => [
      { index: { _index: POSTS_INDEX, _id: post.id } },
      postToDocument(post),
    ]);
    await opensearch.bulk({ body });

    total += posts.length;
    offset += BATCH_SIZE;
    if (posts.length < BATCH_SIZE) break;
  }
  console.log(`Indexed ${total} posts`);
}

async function backfillCommunities() {
  let offset = 0;
  let total = 0;
  while (true) {
    const communities = await listAllActiveCommunitiesForIndexing(BATCH_SIZE, offset);
    if (communities.length === 0) break;

    const body = communities.flatMap((community) => [
      { index: { _index: COMMUNITIES_INDEX, _id: community.id } },
      communityToDocument(community),
    ]);
    await opensearch.bulk({ body });

    total += communities.length;
    offset += BATCH_SIZE;
    if (communities.length < BATCH_SIZE) break;
  }
  console.log(`Indexed ${total} communities`);
}

async function backfillComments() {
  let offset = 0;
  let total = 0;
  while (true) {
    const comments = await listAllActiveCommentsForIndexing(BATCH_SIZE, offset);
    if (comments.length === 0) break;

    const body = comments.flatMap((comment) => [
      { index: { _index: COMMENTS_INDEX, _id: comment.id } },
      commentToDocument(comment),
    ]);
    await opensearch.bulk({ body });

    total += comments.length;
    offset += BATCH_SIZE;
    if (comments.length < BATCH_SIZE) break;
  }
  console.log(`Indexed ${total} comments`);
}

async function backfillProfiles() {
  let offset = 0;
  let total = 0;
  while (true) {
    const users = await listAllUsersForIndexing(BATCH_SIZE, offset);
    if (users.length === 0) break;

    const body = users.flatMap((user) => [
      { index: { _index: PROFILES_INDEX, _id: user.id } },
      profileToDocument(user),
    ]);
    await opensearch.bulk({ body });

    total += users.length;
    offset += BATCH_SIZE;
    if (users.length < BATCH_SIZE) break;
  }
  console.log(`Indexed ${total} profiles`);
}

async function main() {
  await backfillPosts();
  await backfillCommunities();
  await backfillComments();
  await backfillProfiles();
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});