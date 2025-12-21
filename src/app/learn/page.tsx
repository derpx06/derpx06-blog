import { Column, Heading, Meta, Schema, Grid } from "@once-ui-system/core";
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
    <Column maxWidth="m" paddingTop="24">
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
      <Heading marginBottom="l" variant="heading-strong-xl" marginLeft="24">
        {learn.title}
      </Heading>
      <Column fillWidth flex={1} gap="40">
        <Grid columns="1" s={{ columns: 1 }} fillWidth marginBottom="40" gap="16">
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
            />
          ))}
        </Grid>
        <Mailchimp marginBottom="l" />
      </Column>
    </Column>
  );
}
