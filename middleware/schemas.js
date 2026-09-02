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
  username: Joi.string().alphanum().min(3).max(30).required()
});

module.exports = { uuidParam, pagination, postSort, communitySearch, auditLogFilters, communityNameParam , userNameParam};
