import { getPostsHybrid } from "@/utils/utils";
import { baseURL, routes as routesConfig } from "@/resources";
import { courses } from "@/resources/courses";

export default async function sitemap() {
  const blogPosts = await getPostsHybrid(["src", "app", "blog", "posts"], "blog");
  const blogs = blogPosts.map((post) => ({
    url: `${baseURL}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const activeRoutes = Object.keys(routesConfig).filter(
    (route) => routesConfig[route as keyof typeof routesConfig],
  );

  const routes = activeRoutes.map((route) => ({
    url: `${baseURL}${route !== "/" ? route : ""}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  const explainers = (await getPostsHybrid(["src", "app", "explainers", "posts"], "explainers")).map((post) => ({
    url: `${baseURL}/explainers/${post.slug}`,
    lastModified: post.metadata.publishedAt || new Date().toISOString().split("T")[0],
  }));

  const coursePages = courses.map((course) => ({
    url: `${baseURL}/learn/${course.slug}`,
    lastModified: new Date().toISOString().split("T")[0],
  }));

  const courseLessons = courses.flatMap(course => 
    course.topics.flatMap(topic => 
      topic.links.map(link => ({
        url: `${baseURL}/learn/${course.slug}/${link.slug}`,
        lastModified: new Date().toISOString().split("T")[0],
      }))
    )
  );

  return [...routes, ...blogs, ...explainers, ...coursePages, ...courseLessons];
}
