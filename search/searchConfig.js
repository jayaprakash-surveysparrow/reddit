const { POSTS_INDEX, COMMUNITIES_INDEX, COMMENTS_INDEX, PROFILES_INDEX } = require('./indexNames');

// scoreField is whichever field on that entity stands in for "votes" when
// ranking by hot/top — posts and comments have real vote scores, but
// communities and profiles don't, so member_count/karma are the closest
// equivalents. hasCommentCount is only true for posts, since that's the only
// entity the "Comment count" sort option (from Reddit's UI) makes sense for.
// The bare fields (title, body, ...) match whole tokens; the .prefix fields
// (see scripts/setupSearchIndices.js) match partial words via edge n-grams,
// e.g. "tech" matching "technology". .prefix fields are boosted lower than
// their whole-word counterpart so an exact word match always outranks a
// partial one when both exist.
const SEARCH_CONFIG = {
    posts: { index: POSTS_INDEX, fields: ['title^3', 'body', 'title.prefix^1.5', 'body.prefix'], scoreField: 'score', hasCommentCount: true },
    communities: { index: COMMUNITIES_INDEX, fields: ['name^3', 'description', 'name.prefix^1.5', 'description.prefix'], scoreField: 'member_count', hasCommentCount: false },
    comments: { index: COMMENTS_INDEX, fields: ['body', 'body.prefix'], scoreField: 'score', hasCommentCount: false },
    profiles: { index: PROFILES_INDEX, fields: ['username^3', 'username.prefix^1.5'], scoreField: 'karma', hasCommentCount: false },
};

module.exports = { SEARCH_CONFIG };
