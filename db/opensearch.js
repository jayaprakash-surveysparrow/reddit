require('dotenv').config();

const { Client } = require('@opensearch-project/opensearch');
const logger = require('../utils/logger');

const opensearch = new Client({
    node: process.env.OPENSEARCH_URL,
});

module.exports = opensearch;