const { MongoClient } = require("mongodb");
const { ensureContentDatabase } = require("./content-database-schema.cjs");

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(process.env.MONGODB_DB || "derpx06");
    const collectionName = process.env.MONGODB_CONTENT_COLLECTION || "content";
    const write = process.argv.includes("--write");
    const allowDropIndexes = process.argv.includes("--drop-indexes");

    // Say out loud which cluster is about to be touched. .env.local points at
    // production by default, so "which database is this?" should never be a
    // guess before an index is dropped.
    if (write) {
      const { hostname } = new URL(uri.replace(/^mongodb\+srv:\/\//, "https://"));
      console.log(`Target: ${hostname} / ${db.databaseName} / ${collectionName}\n`);
    }

    const plan = await ensureContentDatabase(db, {
      collectionName,
      dryRun: !write,
      allowDropIndexes,
    });

    console.log(
      JSON.stringify(
        {
          collection: collectionName,
          mode: write ? "write" : "dry-run",
          ...plan,
        },
        null,
        2,
      ),
    );

    if (!write) {
      console.log("Dry run only. Pass --write to apply the validator and indexes.");
    } else if (plan.dropIndexes.length > 0 && !allowDropIndexes) {
      console.log(
        `\n${plan.dropIndexes.length} obsolete index(es) left in place. ` +
          "Dropping an index is irreversible — add --drop-indexes to apply.",
      );
    }
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
