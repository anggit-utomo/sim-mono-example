// @sim/shared: queue names, job names, payload types and job options used by BOTH api and worker.

export const FAST_LANE_QUEUE = 'customer-fast-lane';
export const CRON_QUEUE = 'customer-cron';

export const JOBS = {
  PROCESS_INGEST: 'process-ingest',
  SWEEP_PENDING: 'sweep-pending',
  AGGREGATE_STATS: 'aggregate-stats',
} as const;

export const CRON_JOB_NAMES = [JOBS.SWEEP_PENDING, JOBS.AGGREGATE_STATS] as const;
export type CronJobName = (typeof CRON_JOB_NAMES)[number];

export type CustomerPayload = { externalId: string; name: string; email: string };
export type ProcessIngestData = { ingestId: string };

export const MAX_TOTAL_ATTEMPTS = 10;

export const FAST_LANE_JOB_OPTS = {
  attempts: 3,
  backoff: { type: 'exponential', delay: 2_000 },
  removeOnComplete: { count: 1_000 },
  removeOnFail: { age: 7 * 24 * 3600 },
};

export const ingestJobId = (ingestId: string, attempts: number) => `ingest-${ingestId}-${attempts}`;

export const redisConnection = () => ({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
});
