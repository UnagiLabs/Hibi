import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const apiDir = dirname(dirname(fileURLToPath(import.meta.url)));
const migrationsDir = join(apiDir, "prisma", "migrations");
const databasePath = resolveDatabasePath(apiDir);

execSql(databasePath, `
  CREATE TABLE IF NOT EXISTS "_hibi_migrations" (
    "name" TEXT NOT NULL PRIMARY KEY,
    "appliedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

for (const fileName of readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort()) {
  const alreadyApplied = execSql(
    databasePath,
    `SELECT "name" FROM "_hibi_migrations" WHERE "name" = '${escapeSql(fileName)}';`
  ).trim();

  if (alreadyApplied) {
    continue;
  }

  if (fileName === "0002_memory_view_range.sql" && memoryViewSessionRangeColumnsExist(databasePath)) {
    markMigrationApplied(databasePath, fileName);
    console.log(`Applied ${fileName} (already satisfied)`);
    continue;
  }

  const sql = readFileSync(join(migrationsDir, fileName), "utf8");
  execFileSync("sqlite3", [databasePath], {
    input: sql,
    stdio: ["pipe", "inherit", "inherit"]
  });
  markMigrationApplied(databasePath, fileName);
  console.log(`Applied ${fileName}`);
}

function resolveDatabasePath(rootDir) {
  const env = readEnvFile(join(rootDir, ".env"));
  const databaseUrl = env.DATABASE_URL ?? "file:./dev.db";

  if (!databaseUrl.startsWith("file:")) {
    throw new Error(`Only SQLite file: DATABASE_URL is supported by this migration runner.`);
  }

  const filePath = databaseUrl.slice("file:".length);
  if (filePath.startsWith("/")) {
    return filePath;
  }

  return resolve(rootDir, "prisma", filePath);
}

function readEnvFile(path) {
  if (!existsSync(path)) {
    return {};
  }

  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      })
  );
}

function execSql(databasePath, sql) {
  return execFileSync("sqlite3", [databasePath, sql], {
    encoding: "utf8"
  });
}

function markMigrationApplied(databasePath, fileName) {
  execSql(
    databasePath,
    `INSERT INTO "_hibi_migrations" ("name") VALUES ('${escapeSql(fileName)}');`
  );
}

function memoryViewSessionRangeColumnsExist(databasePath) {
  const columns = execSql(databasePath, `PRAGMA table_info("MemoryViewSession");`)
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => line.split("|")[1]);

  return columns.includes("rangeStart") && columns.includes("rangeEnd");
}

function escapeSql(value) {
  return value.replaceAll("'", "''");
}
