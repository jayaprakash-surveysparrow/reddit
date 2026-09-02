const path = require('path');
const winston = require('winston');

const LOG_DIR = path.join(__dirname, '..', 'logs');

// File transports use built-in rotation (maxsize/maxFiles) rather than
// pulling in winston-daily-rotate-file as an extra dependency — this app
// doesn't have production log-volume requirements that would need anything
// more than "don't let one file grow forever."
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    // Every warn/error goes here too, so a single file gives the full story
    // of anything that went wrong without cross-referencing app.log.
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
    // Everything at 'info' and above — normal request activity included.
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'app.log'),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 5,
    }),
  ],
});

logger.add(
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ level, message, timestamp, ...meta }) => {
        const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} ${level}: ${message}${extra}`;
      })
    ),
  })
);

module.exports = logger;
