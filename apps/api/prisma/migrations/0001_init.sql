PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS "Family" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "displayName" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'guardian',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "User_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "MemorySpace" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'baby',
  "displayName" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "MemorySpace_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CareLog" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "memorySpaceId" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "amount" REAL,
  "unit" TEXT,
  "value" REAL,
  "sourceText" TEXT NOT NULL,
  "occurredAt" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "CareLog_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "CareLog_memorySpaceId_fkey" FOREIGN KEY ("memorySpaceId") REFERENCES "MemorySpace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "MemoryItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "memorySpaceId" TEXT NOT NULL,
  "mediaAssetId" TEXT,
  "title" TEXT,
  "body" TEXT NOT NULL,
  "sourceText" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'message',
  "occurredAt" DATETIME NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "MemoryItem_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MemoryItem_memorySpaceId_fkey" FOREIGN KEY ("memorySpaceId") REFERENCES "MemorySpace" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MemoryItem_mediaAssetId_fkey" FOREIGN KEY ("mediaAssetId") REFERENCES "MediaAsset" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "MediaAsset" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "memorySpaceId" TEXT NOT NULL,
  "originalName" TEXT,
  "mimeType" TEXT,
  "sizeBytes" INTEGER,
  "walrusBlobId" TEXT,
  "sha256" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "MediaAsset_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MediaAsset_memorySpaceId_fkey" FOREIGN KEY ("memorySpaceId") REFERENCES "MemorySpace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "Album" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "memorySpaceId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "targetYear" INTEGER,
  "targetMonth" INTEGER,
  "manifestWalrusBlobId" TEXT,
  "manifestSha256" TEXT,
  "status" TEXT NOT NULL DEFAULT 'draft',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "Album_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "Album_memorySpaceId_fkey" FOREIGN KEY ("memorySpaceId") REFERENCES "MemorySpace" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "MemoryViewSession" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "familyId" TEXT NOT NULL,
  "memorySpaceId" TEXT NOT NULL,
  "albumId" TEXT,
  "viewType" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "expiresAt" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" DATETIME NOT NULL,
  CONSTRAINT "MemoryViewSession_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MemoryViewSession_memorySpaceId_fkey" FOREIGN KEY ("memorySpaceId") REFERENCES "MemorySpace" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "MemoryViewSession_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS "User_familyId_idx" ON "User" ("familyId");
CREATE INDEX IF NOT EXISTS "MemorySpace_familyId_idx" ON "MemorySpace" ("familyId");
CREATE INDEX IF NOT EXISTS "CareLog_familyId_occurredAt_idx" ON "CareLog" ("familyId", "occurredAt");
CREATE INDEX IF NOT EXISTS "CareLog_memorySpaceId_occurredAt_idx" ON "CareLog" ("memorySpaceId", "occurredAt");
CREATE INDEX IF NOT EXISTS "CareLog_category_idx" ON "CareLog" ("category");
CREATE INDEX IF NOT EXISTS "MemoryItem_familyId_occurredAt_idx" ON "MemoryItem" ("familyId", "occurredAt");
CREATE INDEX IF NOT EXISTS "MemoryItem_memorySpaceId_occurredAt_idx" ON "MemoryItem" ("memorySpaceId", "occurredAt");
CREATE INDEX IF NOT EXISTS "MediaAsset_familyId_createdAt_idx" ON "MediaAsset" ("familyId", "createdAt");
CREATE INDEX IF NOT EXISTS "MediaAsset_memorySpaceId_createdAt_idx" ON "MediaAsset" ("memorySpaceId", "createdAt");
CREATE INDEX IF NOT EXISTS "MediaAsset_walrusBlobId_idx" ON "MediaAsset" ("walrusBlobId");
CREATE INDEX IF NOT EXISTS "Album_familyId_type_idx" ON "Album" ("familyId", "type");
CREATE INDEX IF NOT EXISTS "Album_memorySpaceId_type_idx" ON "Album" ("memorySpaceId", "type");
CREATE INDEX IF NOT EXISTS "MemoryViewSession_familyId_createdAt_idx" ON "MemoryViewSession" ("familyId", "createdAt");
CREATE INDEX IF NOT EXISTS "MemoryViewSession_memorySpaceId_createdAt_idx" ON "MemoryViewSession" ("memorySpaceId", "createdAt");
CREATE INDEX IF NOT EXISTS "MemoryViewSession_viewType_idx" ON "MemoryViewSession" ("viewType");
CREATE INDEX IF NOT EXISTS "MemoryViewSession_status_idx" ON "MemoryViewSession" ("status");
