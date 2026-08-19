import { courses, type Course } from "@/resources/courses";
import { connectToDatabase } from "@/lib/mongodb";

type CourseStatus = "draft" | "published" | "archived";

type CourseDocument = Course & {
  status?: CourseStatus;
  order?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  source?: { type?: "local" | "mongodb"; path?: string };
};

type CourseStorageMode = "local" | "hybrid" | "mongodb";

function isMongoEnabled() {
  const value = (process.env.USE_MONGODB || "false").toLowerCase();
  return value === "1" || value === "true";
}

function storageMode(): CourseStorageMode {
  const configured = (process.env.COURSE_STORAGE || "").toLowerCase();
  if (configured === "local" || configured === "hybrid" || configured === "mongodb") {
    return configured;
  }

  return isMongoEnabled() ? "hybrid" : "local";
}

function collectionName() {
  return process.env.MONGODB_COURSE_COLLECTION || "courses";
}

function documentToCourse(document: CourseDocument): Course {
  return {
    id: document.id,
    title: document.title,
    description: document.description,
    slug: document.slug,
    image: document.image,
    topics: document.topics,
  };
}

function localCourse(slug: string) {
  return courses.find((course) => course.slug === slug) || null;
}

export function getCourseStorageMode() {
  return storageMode();
}

export async function getCourses(): Promise<Course[]> {
  const mode = storageMode();
  if (mode === "local" || !isMongoEnabled()) return courses;

  try {
    const { db } = await connectToDatabase();
    const documents = await db
      .collection<CourseDocument>(collectionName())
      .find({ status: "published" }, { projection: { _id: 0 } })
      .sort({ order: 1, slug: 1 })
      .toArray();
    const databaseCourses = documents.map(documentToCourse);

    if (mode === "mongodb") return databaseCourses;

    const databaseSlugs = new Set(databaseCourses.map((course) => course.slug));
    return [
      ...databaseCourses,
      ...courses.filter((course) => !databaseSlugs.has(course.slug)),
    ];
  } catch (error) {
    console.error("Failed to fetch courses from MongoDB:", error);
    return courses;
  }
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const mode = storageMode();
  const local = localCourse(slug);
  if (mode === "local" || !isMongoEnabled()) return local;

  try {
    const { db } = await connectToDatabase();
    const collection = db.collection<CourseDocument>(collectionName());
    const document = await collection.findOne(
      { slug, status: "published" },
      { projection: { _id: 0 } },
    );
    if (document) return documentToCourse(document);
    if (mode === "mongodb") return null;

    const existing = await collection.findOne({ slug }, { projection: { _id: 1 } });
    return existing ? null : local;
  } catch (error) {
    console.error(`Failed to fetch course ${slug} from MongoDB:`, error);
    return local;
  }
}
