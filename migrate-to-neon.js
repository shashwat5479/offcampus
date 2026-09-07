// ============================================================================
// One-time data migration: copies ALL data from your CURRENT database into Neon.
// Your current database is only READ from — never modified. Zero data loss.
//
// USAGE (PowerShell, in your project folder):
//   $env:OLD_DATABASE_URL="<your CURRENT db url>"      // the one in your .env now
//   $env:NEW_DATABASE_URL="<your NEON pooled url>"
//   node migrate-to-neon.js
//
// Safe to re-run: uses skipDuplicates, so re-running won't create duplicates.
// ============================================================================

const { PrismaClient } = require("@prisma/client");

const OLD = process.env.OLD_DATABASE_URL;
const NEW = process.env.NEW_DATABASE_URL;

if (!OLD || !NEW) {
  console.error("Set both OLD_DATABASE_URL and NEW_DATABASE_URL environment variables.");
  process.exit(1);
}

const oldDb = new PrismaClient({ datasources: { db: { url: OLD } } });
const newDb = new PrismaClient({ datasources: { db: { url: NEW } } });

// Parents BEFORE children (foreign-key safe order).
const ORDER = [
  "college",
  "user",
  "account",
  "session",
  "verificationToken",
  "community",
  "membership",
  "post",
  "postTag",
  "comment",
  "postVote",
  "commentVote",
  "follow",
  "notification",
  "conversation",
  "message",
  "messageReaction",
  "story",
  "storyReaction",
  "storyHighlight",
  "opportunity",
  "opportunityApplication",
  "confession",
  "confessionVote",
  "confessionComment",
  "confessionReport",
];

async function main() {
  console.log("Reading from OLD, writing to NEON. Old DB is never modified.\n");
  const summary = [];

  for (const model of ORDER) {
    let rows;
    try {
      rows = await oldDb[model].findMany();
    } catch (e) {
      console.log(`  (skip ${model}: ${e.message.split("\n")[0]})`);
      continue;
    }
    if (!rows.length) {
      summary.push(`${model}: 0`);
      continue;
    }
    try {
      // createMany is fast; skipDuplicates makes re-runs safe.
      const res = await newDb[model].createMany({ data: rows, skipDuplicates: true });
      summary.push(`${model}: ${res.count}/${rows.length}`);
      console.log(`✓ ${model}: copied ${res.count} of ${rows.length}`);
    } catch (e) {
      // Fallback: insert one-by-one so one bad row doesn't stop the whole table.
      let ok = 0;
      for (const r of rows) {
        try { await newDb[model].create({ data: r }); ok++; }
        catch (_) { /* likely already exists */ }
      }
      summary.push(`${model}: ${ok}/${rows.length} (one-by-one)`);
      console.log(`✓ ${model}: copied ${ok} of ${rows.length} (fallback)`);
    }
  }

  console.log("\n===== MIGRATION SUMMARY (copied / total) =====");
  summary.forEach((l) => console.log("  " + l));
  console.log("\nDONE. Verify the counts look right, then update DATABASE_URL to Neon.");
}

main()
  .catch((e) => { console.error("\nFAILED:", e); process.exit(1); })
  .finally(async () => { await oldDb.$disconnect(); await newDb.$disconnect(); });