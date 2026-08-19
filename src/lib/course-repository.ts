import { connectToDatabase } from "@/lib/mongodb";
import { failIfBuilding } from "@/lib/build-guard";
import type { Course } from "@/types/content.types";

type CourseDocument = Course & {
  status?: "draft" | "published" | "archived";
  order?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

function collectionName() {
  return process.env.MONGODB_COURSE_COLLECTION || "courses";
}

function toCourse(document: CourseDocument): Course {
  return {
    id: document.id,
    title: document.title,
    description: document.description,
    slug: document.slug,
    image: document.image,
    topics: document.topics ?? [],
  };
}

export async function getCourses(): Promise<Course[]> {
  try {
    const { db } = await connectToDatabase();
    const documents = await db
      .collection<CourseDocument>(collectionName())
      .find({ status: "published" }, { projection: { _id: 0 } })
      .sort({ order: 1, slug: 1 })
      .toArray();

    return documents.map(toCourse);
  } catch (error) {
    failIfBuilding("courses", error);
    console.error("Failed to fetch courses from MongoDB:", error);
    return [];
  }
}

export async function getCourseBySlug(slug: string): Promise<Course | null> {
  try {
    const { db } = await connectToDatabase();
    const document = await db
      .collection<CourseDocument>(collectionName())
      .findOne({ slug, status: "published" }, { projection: { _id: 0 } });

    return document ? toCourse(document) : null;
  } catch (error) {
    failIfBuilding(`course ${slug}`, error);
    console.error(`Failed to fetch course ${slug} from MongoDB:`, error);
    return null;
  }
}
