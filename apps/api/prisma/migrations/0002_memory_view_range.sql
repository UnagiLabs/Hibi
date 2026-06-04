ALTER TABLE "MemoryViewSession" ADD COLUMN "rangeStart" DATETIME;
ALTER TABLE "MemoryViewSession" ADD COLUMN "rangeEnd" DATETIME;

CREATE INDEX IF NOT EXISTS "MemoryViewSession_rangeStart_rangeEnd_idx" ON "MemoryViewSession" ("rangeStart", "rangeEnd");
