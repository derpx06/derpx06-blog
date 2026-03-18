import {
  Heading,
  Text,
  Button,
  Avatar,
  RevealFx,
  Column,
  Row,
  Schema,
  Meta,
  Grid,
} from "@once-ui-system/core";
import { home, about, person, baseURL, routes } from "@/resources";
import { Mailchimp, SeeAllButton } from "@/components";
import { Posts } from "@/components/blog/Posts";
import Post from "@/components/blog/Post";
import { courses } from "@/resources/courses";
import { CanvasTextDemo } from "@/components/ui/canvas-text-demo";

export async function generateMetadata() {
  return Meta.generate({
    title: home.title,
    description: home.description,
    baseURL: baseURL,
    path: home.path,
    image: home.image,
  });
}

type SectionProps = {
  title: string;
  href: string;
  children: React.ReactNode;
};

function HomeSection({ title, href, children }: SectionProps) {
  return (
    <RevealFx translateY="8" fillWidth>
      <Column
        fillWidth
        background="surface"
        border="neutral-alpha-weak"
        radius="l"
        paddingX="20"
        paddingY="20"
        gap="20"
      >
        <Row fillWidth horizontal="between" vertical="center" paddingX="4">
          <Heading as="h2" variant="display-strong-xs" wrap="balance">
            {title}
          </Heading>
          <SeeAllButton href={href} />
        </Row>
        <Column fillWidth>{children}</Column>
      </Column>
    </RevealFx>
  );
}

export default function Home() {
  return (
    <Column maxWidth="m" gap="xl" paddingY="16" horizontal="center">
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
     
      <RevealFx translateY="8" fillWidth>
        <Column
          fillWidth
          horizontal="center"
          align="center"
          gap="12"
          paddingY="20"
          paddingX="8"
        >
          <Text variant="label-default-m" onBackground="brand-weak">
            Software Development • AI Engineering • Mobile Apps
          </Text>
          <CanvasTextDemo />
          <Text variant="body-default-l" align="center" onBackground="neutral-weak" style={{ maxWidth: "56ch" }}>
            {home.subline}
          </Text>
          <Row gap="12" s={{ direction: "column" }}>
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
            {routes["/learn"] && (
              <Button href="/learn" variant="primary" size="m" arrowIcon>
                Start Learning
              </Button>
            )}
          </Row>
        </Column>
      </RevealFx>

      {routes["/learn"] && (
        <HomeSection title="Latest Courses" href="/learn">
          <Row flex={3} paddingX="8">
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
        </HomeSection>
      )}
      {routes["/explainers"] && (
        <HomeSection title="Latest Explainers" href="/explainers">
          <Row flex={3} paddingX="8">
              <Posts
                range={[1, 4]}
                columns="2"
                thumbnail
                direction="column"
                glowing
                source={["src", "app", "explainers", "posts"]}
                pathPrefix="explainers"
              />
          </Row>
        </HomeSection>
      )}
      {routes["/blog"] && (
        <HomeSection title="Latest From The Blog" href="/blog">
          <Row flex={3} paddingX="8">
              <Posts range={[1, 6]} columns="3" thumbnail direction="column" />
          </Row>
        </HomeSection>
      )}

      <Mailchimp />
      
    </Column>
    
  );
}
