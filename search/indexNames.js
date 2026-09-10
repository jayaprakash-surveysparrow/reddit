const POSTS_INDEX = 'posts';
const COMMUNITIES_INDEX = 'communities';
const COMMENTS_INDEX = 'comments';
const PROFILES_INDEX = 'profiles';
// Append-only log of activity (post/comment created, vote cast) — a
// separate index from the four above, which each hold current *state*.
// Dashboards/aggregations need history (what happened, and when), which a
// state index can't give you once something is edited or deleted.
const ACTIVITY_EVENTS_INDEX = 'activity_events';

module.exports = { POSTS_INDEX, COMMUNITIES_INDEX, COMMENTS_INDEX, PROFILES_INDEX, ACTIVITY_EVENTS_INDEX };
