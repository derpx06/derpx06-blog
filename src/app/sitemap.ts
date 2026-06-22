import { getPosts, getPostsHybrid } from "@/utils/utils";
import { baseURL, routes as routesConfig } from "@/resources";
import { courses } from "@/resources/courses";

export default async function sitemap() {
  const useMongo = (process.env.USE_MONGODB || "false").toLowerCase();
  const blogPosts = useMongo === "1" || useMongo === "true" ? await getPostsHybrid(["src", "app", "blog", "posts"]) : getPosts(["src", "app", "blog", "posts"]);
  const blogs = blogPosts.map((post) => ({
    url: `${baseURL}/blog/${post.slug}`,
    lastModified: post.metadata.publishedAt,
  }));

  const works = getPosts(["src", "app", "work", "projects"]).map((post) => ({
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

  const explainers = getPosts(["src", "app", "explainers", "posts"]).map((post) => ({
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

  return [...routes, ...blogs, ...works, ...explainers, ...courseLessons];
}
