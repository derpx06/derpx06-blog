import {
  Heading,
  Text,
  Button,
  Avatar,
  RevealFx,
  Column,
  Badge,
  Row,
  Schema,
  Meta,
  Line,
  Grid,
} from "@once-ui-system/core";
import { home, about, person, baseURL, routes } from "@/resources";
import { Mailchimp, SeeAllButton } from "@/components";
import { Projects } from "@/components/work/Projects";
import { Posts } from "@/components/blog/Posts";
import Post from "@/components/blog/Post";
import { courses } from "@/resources/courses";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

export default function Home() {
  return (
    <Column maxWidth="m" gap="xl" paddingY="12" horizontal="center">
      <Schema
        as="webPage"
        baseURL={baseURL}
        path={home.path}
        title={home.title}
        description={home.description}
        image={`/api/og/generate?title=${encodeURIComponent(home.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}${about.path}`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Column fillWidth horizontal="center" gap="m">
        <Column maxWidth="s" horizontal="center" align="center">
          <Heading variant="display-strong-l" wrap="balance" align="center">
            {home.headline}
          </Heading>
          <Text variant="body-default-l" align="center" onBackground="neutral-weak">
            {home.subline}
          </Text>
          <RevealFx paddingTop="12" delay={0.1} horizontal="center" paddingLeft="12">
            <Button
              id="about"
              data-border="rounded"
              href={about.path}
              variant="secondary"
              size="m"
              weight="default"
              arrowIcon
            >
              <Row gap="8" vertical="center" paddingRight="4">
                {about.avatar.display && (
                  <Avatar
                    marginRight="8"
                    style={{ marginLeft: "-0.75rem" }}
                    src={person.avatar}
                    size="m"
                  />
                )}
                {about.title}
              </Row>
            </Button>
          </RevealFx>
        </Column>
      </Column>

      {routes["/learn"] && (
        <Column fillWidth gap="24" marginBottom="l">
          <Row fillWidth paddingRight="64">
            <Line maxWidth={48} />
          </Row>
          <Column fillWidth gap="24" marginTop="40" s={{ direction: "column" }}>
            <Row flex={1} paddingLeft="l" paddingRight="l" paddingTop="24" horizontal="between" vertical="center">
              <Heading as="h2" variant="display-strong-xs" wrap="balance">
                Latest Courses
              </Heading>
              <SeeAllButton href="/learn" />
            </Row>
            <Row flex={3} paddingX="20">
              <Grid columns="2" s={{ columns: 1 }} fillWidth marginBottom="40" gap="16">
                {courses.slice(0, 4).map((course) => (
                  <Post
                    key={course.id}
                    post={{
                      slug: course.slug,
                      metadata: {
                        title: course.title,
                        summary: course.description,
                        image: course.image,
                        publishedAt: "2024-01-01",
                      },
                      content: "",
                    }}
                    thumbnail
                    pathPrefix="learn"
                    direction="column"
                  />
                ))}
              </Grid>
            </Row>
          </Column>
        </Column>
      )}
      {routes["/explainers"] && (
        <Column fillWidth gap="24" marginBottom="l">
          <Row fillWidth paddingRight="64">
            <Line maxWidth={48} />
          </Row>
          <Column fillWidth gap="24" marginTop="40" s={{ direction: "column" }}>
            <Row flex={1} paddingLeft="l" paddingRight="l" paddingTop="24" horizontal="between" vertical="center">
              <Heading as="h2" variant="display-strong-xs" wrap="balance">
                Latest Explainers
              </Heading>
              <SeeAllButton href="/explainers" />
            </Row>
            <Row flex={3} paddingX="20">
              <Posts
                range={[1, 4]}
                columns="2"
                thumbnail
                direction="column"
                source={["src", "app", "explainers", "posts"]}
                pathPrefix="explainers"
              />
            </Row>
          </Column>
        </Column>
      )}
      {routes["/blog"] && (
        <Column fillWidth gap="24" marginBottom="l">
          <Row fillWidth paddingRight="64">
            <Line maxWidth={48} />
          </Row>
          <Column fillWidth gap="24" marginTop="40" s={{ direction: "column" }}>
            <Row flex={1} paddingLeft="l" paddingRight="l" paddingTop="24" horizontal="between" vertical="center">
              <Heading as="h2" variant="display-strong-xs" wrap="balance">
                Latest from the blog
              </Heading>
              <SeeAllButton href="/blog" />
            </Row>
            <Row flex={3} paddingX="20">
              <Posts range={[1, 6]} columns="3" thumbnail direction="column" />
            </Row>
          </Column>
          <Row fillWidth paddingLeft="64" horizontal="end">
            <Line maxWidth={48} />
          </Row>
        </Column>
      )}
      {/* <RevealFx translateY="16" delay={0.6}>
        <Projects range={[1, 1]} />
      </RevealFx> */}
      <Mailchimp />
    </Column>
  );
}
