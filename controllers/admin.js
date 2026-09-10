const logger = require('../utils/logger');
const opensearch = require('../db/opensearch');
const { ACTIVITY_EVENTS_INDEX } = require('../search/indexNames');
const { buildActivityQuery, buildTopQuery, totalsFromBuckets } = require('../analytics/queries');
const { findActiveCommunityByName } = require('../repositories/community');
const { findUserByUsername } = require('../repositories/user');

function formatTimeline(dateHistogramBuckets) {
    return dateHistogramBuckets.map((bucket) => ({
        date: bucket.key_as_string,
        ...totalsFromBuckets(bucket.by_type.buckets),
    }));
}

async function getCommunityActivity(req, res) {
    try {
        const community = await findActiveCommunityByName(req.params.name);
        if (!community) return res.status(404).json({ error: 'Community not found' });

        const time = req.query.time || 'all';
        const { body } = await opensearch.search({
            index: ACTIVITY_EVENTS_INDEX,
            body: buildActivityQuery('community_id', community.id, time),
        });

        res.status(200).json({
            community: community.name,
            time,
            totals: totalsFromBuckets(body.aggregations.by_type.buckets),
            timeline: formatTimeline(body.aggregations.timeline.buckets),
        });
    } catch (err) {
        logger.error(err.message, { stack: err.stack });
        res.status(500).json({ error: 'Something went wrong' });
    }
}

async function getUserActivity(req, res) {
    try {
        const user = await findUserByUsername(req.params.username);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const time = req.query.time || 'all';
        const { body } = await opensearch.search({
            index: ACTIVITY_EVENTS_INDEX,
            body: buildActivityQuery('user_id', user.id, time),
        });

        res.status(200).json({
            username: user.username,
            time,
            totals: totalsFromBuckets(body.aggregations.by_type.buckets),
            timeline: formatTimeline(body.aggregations.timeline.buckets),
        });
    } catch (err) {
        logger.error(err.message, { stack: err.stack });
        res.status(500).json({ error: 'Something went wrong' });
    }
}

async function getTopActive(req, res) {
    try {
        const time = req.query.time || 'week';
        const limit = req.query.limit ? Number(req.query.limit) : 3;

        const [communitiesResp, usersResp] = await Promise.all([
            opensearch.search({ index: ACTIVITY_EVENTS_INDEX, body: buildTopQuery('community_id', 'community_name', time, limit) }),
            opensearch.search({ index: ACTIVITY_EVENTS_INDEX, body: buildTopQuery('user_id', 'username', time, limit) }),
        ]);

        const communities = communitiesResp.body.aggregations.top.buckets
            .filter((bucket) => bucket.key !== null)
            .map((bucket) => ({
                community_id: bucket.key,
                community_name: bucket.sample.hits.hits[0]?._source.community_name ?? null,
                total: bucket.doc_count,
                breakdown: totalsFromBuckets(bucket.by_type.buckets),
            }));

        const users = usersResp.body.aggregations.top.buckets
            .filter((bucket) => bucket.key !== null)
            .map((bucket) => ({
                user_id: bucket.key,
                username: bucket.sample.hits.hits[0]?._source.username ?? null,
                total: bucket.doc_count,
                breakdown: totalsFromBuckets(bucket.by_type.buckets),
            }));

        res.status(200).json({ time, limit, communities, users });
    } catch (err) {
        logger.error(err.message, { stack: err.stack });
        res.status(500).json({ error: 'Something went wrong' });
    }
}

module.exports = { getCommunityActivity, getUserActivity, getTopActive };
