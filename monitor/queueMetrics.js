require('dotenv').config();
const { auditQueue } = require('../queues/auditQueue');
const { notificationQueue } = require('../queues/notificationQueue');
const { notificationChunkQueue } = require('../queues/notificationChunkQueue');

const QUEUES = [auditQueue, notificationQueue, notificationChunkQueue];
const POLL_INTERVAL_MS = 2000;

const COLUMN_WIDTHS = { name: 24, count: 10 };

function formatRow(name, waiting, active, delayed, completed, failed) {
  return (
    String(name).padEnd(COLUMN_WIDTHS.name) +
    String(waiting).padStart(COLUMN_WIDTHS.count) +
    String(active).padStart(COLUMN_WIDTHS.count) +
    String(delayed).padStart(COLUMN_WIDTHS.count) +
    String(completed).padStart(COLUMN_WIDTHS.count) +
    String(failed).padStart(COLUMN_WIDTHS.count)
  );
}

async function printMetrics() {
  const rows = await Promise.all(
    QUEUES.map(async (queue) => {
      const counts = await queue.getJobCounts('waiting', 'active', 'delayed', 'completed', 'failed');
      return { name: queue.name, ...counts };
    })
  );

  console.clear();
  console.log(`BullMQ queue metrics — ${new Date().toLocaleTimeString()} (refreshes every ${POLL_INTERVAL_MS / 1000}s, Ctrl+C to stop)\n`);
  console.log(formatRow('QUEUE', 'WAITING', 'ACTIVE', 'DELAYED', 'COMPLETED', 'FAILED'));
  console.log('-'.repeat(COLUMN_WIDTHS.name + COLUMN_WIDTHS.count * 5));

  for (const row of rows) {
    console.log(formatRow(row.name, row.waiting, row.active, row.delayed, row.completed, row.failed));
  }
}

function tick() {
  printMetrics().catch((err) => {
    console.error(`Failed to fetch queue metrics: ${err.message}`);
  });
}

tick();
const interval = setInterval(tick, POLL_INTERVAL_MS);

process.on('SIGINT', () => {
  clearInterval(interval);
  process.exit(0);
});
