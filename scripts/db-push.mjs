// Direct DB push: applies a SQL file via the `pg` driver.
// Workaround for `prisma db push` stalling against Neon's pooled endpoint.
//
// Usage:
//   node scripts/db-push.mjs                 # applies prisma/sql/init.sql
//   node scripts/db-push.mjs path/to/file.sql

import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");

// Minimal .env loader (KEY=VALUE, supports optional surrounding quotes,
// ignores blanks and `#` comments). We only need DATABASE_URL.
function loadDotEnv(file) {
  if (!existsSync(file)) return;
  for (const raw of readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv(path.join(projectRoot, ".env.local"));
loadDotEnv(path.join(projectRoot, ".env"));

const sqlPath = path.resolve(
  projectRoot,
  process.argv[2] ?? "prisma/sql/init.sql"
);

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set in environment.");
  process.exit(1);
}

const sql = await readFile(sqlPath, "utf8");

// Neon requires SSL. node-postgres respects sslmode in the URL but we set it
// explicitly to avoid surprises with self-signed chains in some environments.
const client = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false },
  // Fail fast instead of stalling forever like prisma db push did.
  connectionTimeoutMillis: 15_000,
  statement_timeout: 60_000,
});

const redactedHost = (() => {
  try {
    return new URL(url).host;
  } catch {
    return "(unparsable URL)";
  }
})();

console.log(`> Connecting to ${redactedHost} ...`);
await client.connect();
console.log(`> Connected. Applying ${path.relative(process.cwd(), sqlPath)} ...`);

try {
  await client.query("BEGIN");
  await client.query(sql);
  await client.query("COMMIT");
  console.log("✓ Schema applied successfully.");
} catch (err) {
  await client.query("ROLLBACK").catch(() => {});
  console.error("✗ Failed to apply schema:");
  console.error(err);
  process.exitCode = 1;
} finally {
  await client.end();
}
