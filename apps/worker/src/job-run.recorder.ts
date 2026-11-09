import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JobRunStatus, PrismaService } from '@sim/db';

const log = new Logger('JobRunRecorder');

function toJson(value: unknown): object | undefined {
  if (value === undefined || value === null) return undefined;
  try {
    return JSON.parse(JSON.stringify(value)) as object;
  } catch {
    return undefined;
  }
}

// Writes one history row. Never throws: a history failure must never fail the job.
export async function recordJobRun(
  prisma: PrismaService,
  queue: string,
  job: Job,
  status: JobRunStatus,
  error?: unknown,
): Promise<void> {
  try {
    await prisma.jobRun.create({
      data: {
        queue,
        jobName: job.name,
        jobId: typeof job.id === 'string' ? job.id : String(job.id ?? ''),
        status,
        attemptsMade: job.attemptsMade,
        durationMs: Math.max(0, Date.now() - (job.timestamp ?? Date.now())),
        error: error ? String((error as Error)?.message ?? error).slice(0, 1000) : job.failedReason?.slice(0, 1000) ?? null,
        result: toJson(job.returnvalue),
      },
    });
  } catch (err) {
    log.warn(`queue=${queue} jobId=${job.id ?? '?'} history write failed: ${(err as Error).message}`);
  }
}
