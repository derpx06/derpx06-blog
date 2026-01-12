"use client";

import { Card, Column, Media, Row, Avatar, Text } from "@once-ui-system/core";
import { formatDate } from "@/utils/formatDate";
import { person } from "@/resources";
import { SmartTruncate } from "@/components/SmartTruncate";

interface PostProps {
  post: any;
  thumbnail: boolean;
  direction?: "row" | "column";
  pathPrefix?: string;
}

export default function Post({ post, thumbnail, direction, pathPrefix = "blog" }: PostProps) {
  return (
    <Card
      fillWidth
      key={post.slug}
      href={post.metadata.link || `/${pathPrefix}/${post.slug}`}
      transition="micro-medium"
      direction={direction}
      border="neutral-medium"
      background="transparent"
      padding="4"
      radius="l-4"
      gap={direction === "column" ? undefined : "24"}
      s={{ direction: "column" }}
    >
      {post.metadata.image && thumbnail && (
        <Media
          priority
          sizes="(max-width: 768px) 100vw, 640px"
          border="neutral-alpha-weak"
          cursor="interactive"
          radius="l"
          src={post.metadata.image}
          alt={"Thumbnail of " + post.metadata.title}
          aspectRatio="16 / 9"
        />
      )}
      <Row fillWidth>
        <Column paddingY="24" paddingX="l" gap="20" vertical="center" fillWidth>
          <Row gap="24" vertical="center">
            <Row vertical="center" gap="16">
              <Avatar src={person.avatar} size="s" />
              <Text variant="label-default-s">{person.name}</Text>
            </Row>
            <Text variant="body-default-xs" onBackground="neutral-weak">
              {formatDate(post.metadata.publishedAt, false)}
            </Text>
          </Row>
          <Column gap="8" fillWidth>
            <Text variant="heading-strong-l" wrap="balance">
              {post.metadata.title}
            </Text>
            {post.metadata.summary && (
              <SmartTruncate
                as={Text}
                variant="body-default-m"
                onBackground="neutral-weak"
              >
                {post.metadata.summary}
              </SmartTruncate>
            )}
            {post.metadata.topics && post.metadata.topics.length > 0 && (
              <Row gap="8" wrap>
                {post.metadata.topics.map((topic: string, index: number) => (
                  <Row key={index} background="neutral-alpha-weak" radius="m" paddingX="8" paddingY="4">
                    <Text variant="label-default-s">
                      {topic}
                    </Text>
                  </Row>
                ))}
              </Row>
            )}
          </Column>
          {post.metadata.tag && (
            <Text variant="label-strong-s" onBackground="neutral-weak">
              {post.metadata.tag}
            </Text>
          )}
        </Column>
      </Row>
    </Card>
  );
}
