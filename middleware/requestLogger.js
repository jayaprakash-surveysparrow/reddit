const logger = require('../utils/logger');

// Logged on 'finish' (after the response is fully sent) rather than at the
// start of the request: this way the log line carries the actual outcome
// (status code, real duration) instead of needing two separate "started"/
// "finished" lines stitched back together later. req.user is read here, not
// captured up front, so it reflects whatever requireAuth set for this
// request by the time it completes.
function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;

    const meta = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durationMs * 100) / 100,
      ip: req.ip,
      userAgent: req.get('user-agent') || null,
      userId: req.user ? req.user.id : null,
    };

    const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${meta.durationMs}ms`;

    if (res.statusCode >= 500) {
      logger.error(message, meta);
    } else if (res.statusCode >= 400) {
      logger.warn(message, meta);
    } else {
      logger.info(message, meta);
    }
  });

  next();
}

module.exports = requestLogger;
