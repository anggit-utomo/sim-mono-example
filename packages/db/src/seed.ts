import { config } from 'dotenv';
import path from 'path';
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';

config(); // packages/db/.env if present
config({ path: path.resolve(__dirname, '..', '..', '.env') }); // repo root .env

const TOTAL = 300_000;
const BATCH = 5_000;

// Fixed seed: reruns generate identical rows, so skipDuplicates inserts zero.
faker.seed(20261109);

function externalId(n: number): string {
  return `EXT-${String(n).padStart(6, '0')}`;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    let inserted = 0;
    for (let start = 1; start <= TOTAL; start += BATCH) {
      const end = Math.min(start + BATCH - 1, TOTAL);
      const data = [];
      for (let n = start; n <= end; n++) {
        data.push({
          externalId: externalId(n),
          name: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
        });
      }
      const res = await prisma.customer.createMany({ data, skipDuplicates: true });
      inserted += res.count;
      if ((start - 1) % 50_000 === 0) {
        // eslint-disable-next-line no-console
        console.log(`seed progress: ${end}/${TOTAL} (inserted ${inserted})`);
      }
    }
    const total = await prisma.customer.count();
    // eslint-disable-next-line no-console
    console.log(`seed done: inserted ${inserted}, total customers ${total}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
