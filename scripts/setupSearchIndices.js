require('dotenv').config();
const opensearch = require('../db/opensearch');
const { POSTS_INDEX, COMMUNITIES_INDEX, COMMENTS_INDEX, PROFILES_INDEX, ACTIVITY_EVENTS_INDEX } = require('../search/indexNames');

// Edge n-grams let a partial word like "tech" match a full word like
// "technology". The index-time analyzer breaks each token into every prefix
// (te, tec, tech, techn, ... technology) so the token "tech" actually exists
// in the index. The search-time analyzer deliberately does NOT do the same
// n-gram split — a query is analyzed as whole words only, and just looked up
// against whatever prefix tokens already exist from indexing. If both sides
// n-grammed, "tech" would match on its own 2-letter prefix "te" against
// anything, which is far too loose.
const analysisSettings = {
    analysis: {
        filter: {
            edge_ngram_filter: {
                type: 'edge_ngram',
                min_gram: 2,
                max_gram: 20,
            },
        },
        analyzer: {
            prefix_index_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase', 'edge_ngram_filter'],
            },
            prefix_search_analyzer: {
                type: 'custom',
                tokenizer: 'standard',
                filter: ['lowercase'],
            },
        },
    },
};

function textWithPrefix() {
    return {
        type: 'text',
        fields: {
            prefix: {
                type: 'text',
                analyzer: 'prefix_index_analyzer',
                search_analyzer: 'prefix_search_analyzer',
            },
        },
    };
}

const postsMapping = {
    properties: {
        id: { type: 'keyword'},
        community_id: { type: 'keyword' },
        community_name: { type: 'keyword' },
        author_id: { type: 'keyword' },
        author_username: { type: 'keyword' },
        title: textWithPrefix(),
        body: textWithPrefix(),
        post_type: { type: 'keyword' },
        score: { type: 'integer' },
        comment_count: { type: 'integer' },
        created_at: { type: 'date' },
    },
};

const communitiesMapping = {
    properties: {
        id: { type: 'keyword' },
        name: { type: 'text', fields: { keyword: { type: 'keyword' }, prefix: { type: 'text', analyzer: 'prefix_index_analyzer', search_analyzer: 'prefix_search_analyzer' } } },
        description: textWithPrefix(),
        member_count: { type: 'integer' },
        created_at: { type: 'date' },
    },
}

const commentsMapping = {
    properties: {
        id: { type: 'keyword' },
        post_id: { type: 'keyword' },
        author_id: { type: 'keyword' },
        author_username: { type: 'keyword' },
        body: textWithPrefix(),
        score: { type: 'integer' },
        created_at: { type: 'date' },
    },
};

const profilesMapping = {
    properties: {
        id: { type: 'keyword' },
        username: { type: 'text', fields: { keyword: { type: 'keyword' }, prefix: { type: 'text', analyzer: 'prefix_index_analyzer', search_analyzer: 'prefix_search_analyzer' } } },
        karma: { type: 'integer' },
        created_at: { type: 'date' },
    },
};

// Pure structured data for aggregations, not full-text search — plain
// keyword/date fields only, no analyzers needed here.
const activityEventsMapping = {
    properties: {
        type: { type: 'keyword' }, // 'post_created' | 'comment_created' | 'vote_cast'
        user_id: { type: 'keyword' },
        username: { type: 'keyword' },
        community_id: { type: 'keyword' },
        community_name: { type: 'keyword' },
        target_type: { type: 'keyword' }, // 'post' | 'comment'
        target_id: { type: 'keyword' },
        created_at: { type: 'date' },
    },
};

async function createIndexIfMissing(index, mapping) {
    const {body: exists} = await opensearch.indices.exists({ index });
    if(exists){
        console.log(`Index "${index}" already exists, skipping`);
        return;
    }
    await opensearch.indices.create({ index, body: { settings: analysisSettings, mappings: mapping } });
    console.log(`Created index "${index}"`);
}

async function main() {
    await createIndexIfMissing(POSTS_INDEX, postsMapping);
    await createIndexIfMissing(COMMUNITIES_INDEX, communitiesMapping);
    await createIndexIfMissing(COMMENTS_INDEX, commentsMapping);
    await createIndexIfMissing(PROFILES_INDEX, profilesMapping);
    await createIndexIfMissing(ACTIVITY_EVENTS_INDEX, activityEventsMapping);
    process.exit(0);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
