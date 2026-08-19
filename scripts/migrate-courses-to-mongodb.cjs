const fs = require("node:fs");
const path = require("node:path");
const typescript = require("typescript");
const { MongoClient } = require("mongodb");
const { courseKey, normalizeCourse } = require("./course-migration-utils.cjs");
const { ensureCourseDatabase } = require("./course-database-schema.cjs");

const root = process.cwd();
const sourcePath = "src/resources/courses.ts";

function loadLocalCourses() {
  const source = fs.readFileSync(path.join(root, sourcePath), "utf8");
  const output = typescript.transpileModule(source, {
    compilerOptions: { module: typescript.ModuleKind.CommonJS, target: typescript.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  new Function("exports", "module", output)(module.exports, module);
  return module.exports.courses || [];
}

function inspectCourses() {
  const errors = [];
  const seen = new Set();
  const courses = loadLocalCourses().map((course, order) => {
    try {
      const normalized = normalizeCourse({ course, order, sourcePath });
      const key = courseKey(normalized);
      if (seen.has(key)) errors.push(`Duplicate course slug: ${key}`);
      seen.add(key);
      return normalized;
    } catch (error) {
      errors.push(`${course?.id || "unknown"}: ${error instanceof Error ? error.message : String(error)}`);
      return null;
    }
  }).filter(Boolean);

  return { courses, errors };
}

function printReport({ courses, errors }) {
  console.log(`Course records: ${courses.length}`);
  console.log(`Lesson links: ${courses.reduce((total, course) => total + course.topics.reduce((count, topic) => count + topic.links.length, 0), 0)}`);
  console.log(`Errors: ${errors.length}`);
  for (const error of errors) console.error(`ERROR: ${error}`);
}

async function writeCourses(courses) {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  const client = new MongoClient(uri);
  await client.connect();

  try {
    const db = client.db(process.env.MONGODB_DB || "derpx06");
    const collectionName = process.env.MONGODB_COURSE_COLLECTION || "courses";
    await ensureCourseDatabase(db, { collectionName });
    const collection = db.collection(collectionName);

    for (const course of courses) {
      const { createdAt, ...setFields } = course;
      await collection.updateOne(
        { slug: course.slug },
        {
          $set: setFields,
          $setOnInsert: { createdAt },
        },
        { upsert: true },
      );
    }

    console.log(`Imported ${courses.length} courses into ${collectionName}`);
  } finally {
    await client.close();
  }
}

async function main() {
  const report = inspectCourses();
  printReport(report);

  if (report.errors.length > 0) {
    process.exitCode = 1;
    return;
  }

  if (process.argv.includes("--write")) {
    await writeCourses(report.courses);
  } else {
    console.log("Dry run only. Pass --write to import courses.");
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
