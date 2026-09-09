import { cache } from "react";
import { connectToDatabase } from "@/lib/mongodb";
import { failIfBuilding } from "@/lib/build-guard";
import { snapshotCourses } from "@/lib/content-snapshot";
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
    if (failIfBuilding("courses", error)) return snapshotCourses();
    console.error("Failed to fetch courses from MongoDB:", error);
    return [];
  }
}

/**
 * Wrapped in `cache()` because the lesson layout and the lesson page both ask
 * for the same course on every render — two identical queries per lesson view.
 */
export const getCourseBySlug = cache(async (slug: string): Promise<Course | null> => {
  try {
    const { db } = await connectToDatabase();
    const document = await db
      .collection<CourseDocument>(collectionName())
      .findOne({ slug, status: "published" }, { projection: { _id: 0 } });

    return document ? toCourse(document) : null;
  } catch (error) {
    if (failIfBuilding(`course ${slug}`, error)) {
      return snapshotCourses().find((course) => course.slug === slug) ?? null;
    }
    console.error(`Failed to fetch course ${slug} from MongoDB:`, error);
    return null;
  }
});
