const router = require('express').Router();
const searchController = require('../controllers/search');
const {validate} = require('../middleware/validate');
const {searchQuery} = require('../middleware/schemas');

router.get('/', validate(searchQuery, 'query'), searchController.search);

module.exports = router;