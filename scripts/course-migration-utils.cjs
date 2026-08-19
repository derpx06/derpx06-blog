function normalizeCourse({ course = {}, order = 0, sourcePath = "src/resources/courses.ts", now = new Date() }) {
  if (!course.id || !course.slug) {
    throw new Error("Course id and slug are required");
  }

  const timestamp = now instanceof Date ? now : new Date(now);
  const topics = Array.isArray(course.topics) ? course.topics : [];

  return {
    id: String(course.id),
    title: typeof course.title === "string" ? course.title : "",
    description: typeof course.description === "string" ? course.description : "",
    slug: String(course.slug),
    image: typeof course.image === "string" ? course.image : "",
    topics: topics.map((topic) => ({
      title: typeof topic.title === "string" ? topic.title : "",
      links: Array.isArray(topic.links) ? topic.links.map((link) => ({
        title: typeof link.title === "string" ? link.title : "",
        slug: typeof link.slug === "string" ? link.slug : "",
        postSlugs: Array.isArray(link.postSlugs) ? link.postSlugs.map(String) : [],
      })) : [],
    })),
    status: "published",
    order,
    createdAt: timestamp,
    updatedAt: timestamp,
    source: { type: "local", path: sourcePath },
  };
}

function courseKey(course) {
  return course.slug;
}

module.exports = { courseKey, normalizeCourse };
