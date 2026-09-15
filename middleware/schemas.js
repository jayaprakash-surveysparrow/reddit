const Joi = require('joi');
const { AUDITED_MODELS } = require('../db/auditHooks');

const uuidParam = Joi.object({
  id: Joi.string().guid().required(),
});

const pagination = Joi.object({
  page: Joi.number().integer().min(1),
  limit: Joi.number().integer().min(1),
});

const postSort = Joi.object({
  sort: Joi.string().valid('hot', 'top', 'new'),
});

const communitySearch = Joi.object({
  q: Joi.string().max(100),
});

const auditLogFilters = Joi.object({
  entityType: Joi.string().valid(...AUDITED_MODELS),
  entityId: Joi.string().guid(),
  actorId: Joi.string().guid(),
});

const communityNameParam = Joi.object({
  name: Joi.string().alphanum().min(3).max(30).required()
});

const userNameParam = Joi.object({
  username: Joi.string()
  .pattern(/^[a-zA-Z0-9]+([_-][a-zA-Z0-9]+)*$/)
  .min(3).max(30).required()
});

const searchQuery = Joi.object({
  q: Joi.string().min(1).max(200).required(),
  limit: Joi.number().integer().min(1).max(25),
  sort: Joi.string().valid('relevance', 'hot', 'top', 'new', 'comments'),
  time: Joi.string().valid('hour', 'today', 'week', 'month', 'year', 'all'),
});

const activityQuery = Joi.object({
  time: Joi.string().valid('hour', 'today', 'week', 'month', 'year', 'all'),
});

const topActiveQuery = activityQuery.concat(Joi.object({
  limit: Joi.number().integer().min(1).max(10),
}));

const communityAutocompleteQuery = Joi.object({
  q: Joi.string().alphanum().min(1).max(21).required(),
  limit: Joi.number().integer().min(1).max(10),
});

module.exports = { uuidParam, pagination, postSort, communitySearch, auditLogFilters, communityNameParam , userNameParam, searchQuery, activityQuery, topActiveQuery, communityAutocompleteQuery };
