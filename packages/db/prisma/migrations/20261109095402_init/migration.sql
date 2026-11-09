-- CreateEnum
CREATE TYPE "IngestOperation" AS ENUM ('CREATE', 'UPDATE');

-- CreateEnum
CREATE TYPE "IngestStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "JobRunStatus" AS ENUM ('COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "lastIngestAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerIngest" (
    "id" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "operation" "IngestOperation" NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "IngestStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "processedAt" TIMESTAMP(3),

    CONSTRAINT "CustomerIngest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobRun" (
    "id" TEXT NOT NULL,
    "queue" TEXT NOT NULL,
    "jobName" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "status" "JobRunStatus" NOT NULL,
    "attemptsMade" INTEGER NOT NULL DEFAULT 0,
    "durationMs" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "result" JSONB,
    "finishedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JobRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_externalId_key" ON "Customer"("externalId");

-- CreateIndex
CREATE INDEX "Customer_email_idx" ON "Customer"("email");

-- CreateIndex
CREATE INDEX "CustomerIngest_status_createdAt_idx" ON "CustomerIngest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "CustomerIngest_externalId_idx" ON "CustomerIngest"("externalId");

-- CreateIndex
CREATE INDEX "JobRun_queue_finishedAt_idx" ON "JobRun"("queue", "finishedAt");

-- CreateIndex
CREATE INDEX "JobRun_status_finishedAt_idx" ON "JobRun"("status", "finishedAt");
