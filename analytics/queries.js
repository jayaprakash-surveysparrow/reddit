const { buildTimeFilter } = require('../search/timeFilter');

// Coarser buckets for wider time windows so the timeline doesn't return an
// unreasonable number of buckets (e.g. hourly buckets over "all time").
function intervalFor(time) {
    if (time === 'hour' || time === 'today') return 'hour';
    if (time === 'week' || time === 'month') return 'day';
    if (time === 'year') return 'week';
    return 'month'; // 'all'
}

const EVENT_TYPES = ['post_created', 'comment_created', 'vote_cast'];

function emptyTotals(){
    return EVENT_TYPES.reduce((totals, type) => {
        totals[type] = 0;
        return totals;
    }, {});
}

// Turns a `terms` aggregation's buckets (from an aggregation on the `type`
// field) into a plain { post_created: N, comment_created: N, vote_cast: N }
// object — 0 for any type that had no matching events, rather than the
// bucket just being absent.
function totalsFromBuckets(buckets) {
    const totals = emptyTotals();
    for (const bucket of buckets) {
        if (Object.prototype.hasOwnProperty.call(totals, bucket.key)) {
            totals[bucket.key] = bucket.doc_count;
        }
    }
    return totals;
}


// Single-entity activity: totals by event type, plus a time-bucketed
// breakdown for a trend chart. `filterField` is 'community_id' or 'user_id'.
function buildActivityQuery(filterField, filterValue, time) {
    const filter = [{ term: { [filterField]: filterValue } }];
    const timeFilter = buildTimeFilter(time);
    if (timeFilter) filter.push(timeFilter);

    return {
        size: 0,
        query: { bool: { filter } },
        aggs: {
            by_type: { terms: { field: 'type', size: EVENT_TYPES.length } },
            timeline: {
                date_histogram: {
                    field: 'created_at',
                    calendar_interval: intervalFor(time),
                    time_zone: 'UTC',
                    min_doc_count: 0,
                },
                aggs: {
                    by_type: { terms: { field: 'type', size: EVENT_TYPES.length } },
                },
            },
        },
    };
}

// Top-N ranking: groups all matching events by `groupField` ('community_id'
// or 'user_id'), counts them (posts + comments + votes together = overall
// "activity"), and grabs one sample document per group via top_hits just to
// read its display name (community_name/username) cheaply.
function buildTopQuery(groupField, sampleField, time, limit) {
    const timeFilter = buildTimeFilter(time);
    const query = timeFilter ? { bool: { filter: [timeFilter] } } : { match_all: {} };

    return {
        size: 0,
        query,
        aggs: {
            top: {
                terms: { field: groupField, size: limit, order: { _count: 'desc' } },
                aggs: {
                    by_type: { terms: { field: 'type', size: EVENT_TYPES.length } },
                    sample: { top_hits: { size: 1, _source: [sampleField] } },
                },
            },
        },
    };
}

module.exports = { buildActivityQuery, buildTopQuery, totalsFromBuckets, emptyTotals };
