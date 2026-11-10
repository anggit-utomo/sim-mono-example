import { ServiceUnavailableException } from '@nestjs/common';

// BullMQ buffers commands instead of throwing when Redis is down, so every
// queue call is raced against a timeout. Slow Prisma/validation errors pass
// through untouched: only queue calls go through here, and any queue failure
// becomes an honest 503 instead of a hung request.
export async function withQueue<T>(op: Promise<T>, timeoutMs = 3_000): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('queue timeout')), timeoutMs),
  );
  try {
    return await Promise.race([op, timeout]);
  } catch (err) {
    if (err instanceof ServiceUnavailableException) throw err;
    throw new ServiceUnavailableException('queue unavailable (Redis down?)');
  }
}
