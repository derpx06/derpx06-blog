import { Column, Heading, Meta, Schema, Grid, Text } from "@once-ui-system/core";
import { Mailchimp } from "@/components";
import Post from "@/components/blog/Post";
import { baseURL, person, learn } from "@/resources";
import { courses } from "@/resources/courses";

export async function generateMetadata() {
  return Meta.generate({
    title: learn.title,
    description: learn.description,
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent(learn.title)}`,
    path: learn.path,
  });
}

export default function Learn() {
  return (
    <Column maxWidth="m" paddingTop="24" paddingX="16" horizontal="center">
      <Schema
        as="blogPosting"
        baseURL={baseURL}
        title={learn.title}
        description={learn.description}
        path={learn.path}
        image={`/api/og/generate?title=${encodeURIComponent(learn.title)}`}
        author={{
          name: person.name,
          url: `${baseURL}/learn`,
          image: `${baseURL}${person.avatar}`,
        }}
      />
      <Column fillWidth horizontal="center" align="center" marginBottom="l" maxWidth="s">
        <Heading marginBottom="m" variant="heading-strong-xl" align="center">
          {learn.title}
        </Heading>
        <Text
          variant="body-default-l"
          onBackground="neutral-weak"
          align="center"
          wrap="balance"
        >
          {learn.description}
        </Text>
      </Column>
      <Column fillWidth flex={1} gap="40">
        <Grid
          columns="2"
          s={{ columns: 1 }}
          m={{ columns: 1 }}
          fillWidth
          gap="16"
        >
          {courses.map((course) => (
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
        <Mailchimp marginBottom="l" />
      </Column>
    </Column>
  );
}
