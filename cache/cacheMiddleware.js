const redis = require('../db/redis');
const { routes } = require('./config');
const { recordHitAndCheckHot } = require('./hotness');
const { getVersion } = require('./version');
const logger = require('../utils/logger');

// Hotness is tracked on the base key (route + params), never the versioned
// storage key — otherwise every mutation-triggered version bump would reset
// a resource's popularity back to zero, and a frequently-edited-but-popular
// resource would rarely accumulate enough hits to ever get cached. Whether
// something is POPULAR and whether a CACHED COPY of it is still VALID are
// two separate questions, tracked separately.
function cacheRoute(routeName) {
  const config = routes[routeName];
  if (!config) throw new Error(`No cache config registered for route "${routeName}"`);

  return async function cacheMiddleware(req, res, next) {
    try {
      const hotnessKey = config.buildKeyBase(req);
      const isHot = await recordHitAndCheckHot(hotnessKey);

      if (!isHot) {
        res.set('X-Cache', 'SKIP');
        return next();
      }

      const storageKey = config.versionNamespace
        ? `${hotnessKey}:v${await getVersion(config.versionNamespace(req))}`
        : hotnessKey;
      const cacheKey = `cache:${storageKey}`;

      const cached = await redis.get(cacheKey);
      if (cached) {
        res.set('X-Cache', 'HIT');
        return res.status(200).json(JSON.parse(cached));
      }

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        res.set('X-Cache', 'MISS');
        if (res.statusCode === 200) {
          redis.set(cacheKey, JSON.stringify(body), 'EX', config.ttlSeconds).catch((err) => {
            logger.error('Cache write failed', { error: err.message });
          });
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      // A cache failure (e.g. Redis unreachable) must never break the
      // actual request — fall through to serving it uncached.
      logger.error('Cache middleware error', { error: err.message });
      next();
    }
  };
}

module.exports = { cacheRoute };
