const logger = require('../utils/logger');
const opensearch = require('../db/opensearch');
const { SEARCH_CONFIG } = require('../search/searchConfig');
const { buildSearchBody } = require('../search/queryBuilder');

const CATEGORIES = Object.entries(SEARCH_CONFIG);

async function search(req, res) {
    try {
        const q = req.query.q;
        const limit = req.query.limit ? Number(req.query.limit) : 10;
        const sort = req.query.sort || 'relevance';
        const time = req.query.time || 'all';

        const msearchBody = CATEGORIES.flatMap(([, config]) => [
            { index: config.index },
            buildSearchBody(config, q, sort, time, limit),
        ]);

        const { body } = await opensearch.msearch({ body: msearchBody });

        const results = {};
        CATEGORIES.forEach(([key], i) => {
            results[key] = body.responses[i].hits.hits.map((hit) => hit._source);
        });

        res.status(200).json(results);
    } catch(err) {
        logger.error(err.message, { stack: err.stack });
        res.status(500).json({error: 'Something went wrong'});
    }
}

module.exports = {search};
