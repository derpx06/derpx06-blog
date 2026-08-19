import { getContentList } from "@/lib/content-repository";
import { getCourses } from "@/lib/course-repository";
import { baseURL, routes as routesConfig } from "@/resources";

export default async function sitemap() {
  const [blogPosts, works, explainerPosts, courses] = await Promise.all([
    getContentList("blog"),
    getContentList("work"),
    getContentList("explainers"),
    getCourses(),
  ]);
  const blogs = blogPosts.map((post) => ({
    url: `${baseURL}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const workRoutes = works.map((post) => ({
    url: `${baseURL}/work/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const activeRoutes = Object.keys(routesConfig).filter(
    (route) => routesConfig[route as keyof typeof routesConfig],
  );

  const routes = activeRoutes.map((route) => ({
    url: `${baseURL}${route !== "/" ? route : ""}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  const explainers = explainerPosts.map((post) => ({
    url: `${baseURL}/explainers/${post.slug}`,
    lastModified: post.metadata.publishedAt || new Date().toISOString().split("T")[0],
  }));

  const courseLessons = courses.flatMap(course => 
    course.topics.flatMap(topic => 
      topic.links.map(link => ({
        url: `${baseURL}/learn/${course.slug}/${link.slug}`,
        lastModified: new Date().toISOString().split("T")[0],
      }))
    )
  );

  return [...routes, ...blogs, ...workRoutes, ...explainers, ...courseLessons];
}
