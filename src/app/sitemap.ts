import { getContentList } from "@/lib/content-repository";
import { getCourses } from "@/lib/course-repository";
import { baseURL } from "@/resources";
import { isRouteEnabled, routes as routesConfig } from "@/resources/route-policy";

export default async function sitemap() {
  const [blogPosts, works, explainerPosts, courses] = await Promise.all([
    getContentList("blog"),
    getContentList("work"),
    getContentList("explainers"),
    getCourses(),
  ]);
  // Only advertise a section's items when the section itself is live —
  // otherwise the sitemap hands crawlers URLs that now 404 (/work/*).
  const inSection = <T>(section: `/${string}`, items: T[]) =>
    isRouteEnabled(section) ? items : [];

  const blogs = inSection(
    "/blog",
    blogPosts.map((post) => ({
      url: `${baseURL}/blog/${post.slug}`,
      lastModified: post.metadata.publishedAt,
    })),
  );

  const workRoutes = inSection(
    "/work",
    works.map((post) => ({
      url: `${baseURL}/work/${post.slug}`,
      lastModified: post.metadata.publishedAt,
    })),
  );

  const activeRoutes = Object.keys(routesConfig).filter(
    (route) => routesConfig[route as keyof typeof routesConfig],
  );

  const routes = activeRoutes.map((route) => ({
    url: `${baseURL}${route !== "/" ? route : ""}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  const explainers = inSection(
    "/explainers",
    explainerPosts.map((post) => ({
      url: `${baseURL}/explainers/${post.slug}`,
      lastModified: post.metadata.publishedAt || new Date().toISOString().split("T")[0],
    })),
  );

  const courseLessons = inSection(
    "/learn",
    courses.flatMap((course) =>
      course.topics.flatMap((topic) =>
        topic.links.map((link) => ({
          url: `${baseURL}/learn/${course.slug}/${link.slug}`,
          lastModified: new Date().toISOString().split("T")[0],
        })),
      ),
    ),
  );

  return [...routes, ...blogs, ...workRoutes, ...explainers, ...courseLessons];
}
