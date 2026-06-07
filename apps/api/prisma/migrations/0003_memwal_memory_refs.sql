CREATE TABLE IF NOT EXISTS "MemWalMemoryRef" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "memorySpaceId" TEXT NOT NULL,
  "sourceType" TEXT NOT NULL,
  "sourceId" TEXT NOT NULL,
  "namespace" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "jobId" TEXT,
  "blobId" TEXT,
  "error" TEXT,
  "textPreview" TEXT,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "MemWalMemoryRef_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MemWalMemoryRef_memorySpaceId_fkey" FOREIGN KEY ("memorySpaceId") REFERENCES "MemorySpace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "MemWalMemoryRef_familyId_createdAt_idx" ON "MemWalMemoryRef" ("familyId", "createdAt");
CREATE INDEX IF NOT EXISTS "MemWalMemoryRef_memorySpaceId_createdAt_idx" ON "MemWalMemoryRef" ("memorySpaceId", "createdAt");
CREATE INDEX IF NOT EXISTS "MemWalMemoryRef_sourceType_sourceId_idx" ON "MemWalMemoryRef" ("sourceType", "sourceId");
CREATE INDEX IF NOT EXISTS "MemWalMemoryRef_status_idx" ON "MemWalMemoryRef" ("status");
CREATE INDEX IF NOT EXISTS "MemWalMemoryRef_jobId_idx" ON "MemWalMemoryRef" ("jobId");
CREATE INDEX IF NOT EXISTS "MemWalMemoryRef_blobId_idx" ON "MemWalMemoryRef" ("blobId");
