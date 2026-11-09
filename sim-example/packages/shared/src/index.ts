// @sim/shared: queue names, job names, payload types and job options used by BOTH api and worker.

export const FAST_LANE_QUEUE = 'customer-fast-lane';
export const CRON_QUEUE = 'customer-cron';

export const JOBS = {
  PROCESS_INGEST: 'process-ingest', // fast lane
  SWEEP_PENDING: 'sweep-pending', // cron: safety net for the fast lane
  AGGREGATE_STATS: 'aggregate-stats', // cron: nightly stats
} as const;

export const CRON_JOB_NAMES = [JOBS.SWEEP_PENDING, JOBS.AGGREGATE_STATS] as const;
export type CronJobName = (typeof CRON_JOB_NAMES)[number];

export type CustomerPayload = { externalId: string; name: string; email: string };
export type ProcessIngestData = { ingestId: string };

// Total processing attempts per ingest row (across fast-lane retries AND sweeper re-enqueues).
export const MAX_TOTAL_ATTEMPTS = 10;

export const FAST_LANE_JOB_OPTS = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2_000 },
  removeOnComplete: { count: 1_000 },
  removeOnFail: { age: 7 * 24 * 3600 }, // keep failed jobs 7 days for the dashboard
};

// BullMQ ignores an add() whose jobId already exists in Redis, so this gives us de-duplication.
// Including `attempts` lets the sweeper enqueue a fresh job after a previous one failed.
// (BullMQ custom ids must not contain ":".)
export const ingestJobId = (ingestId: string, attempts: number) => `ingest-${ingestId}-${attempts}`;

export const redisConnection = () => ({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
});
