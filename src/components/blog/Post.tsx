"use client";

import { useState, MouseEvent } from "react";
import { Card, Column, Media, Row, Avatar, Text } from "@once-ui-system/core";
import { formatDate } from "@/utils/formatDate";
import { person } from "@/resources";
import { SmartTruncate } from "@/components/SmartTruncate";
import "./post-3d.css";

interface PostProps {
  post: any;
  thumbnail: boolean;
  direction?: "row" | "column";
  pathPrefix?: string;
  variant?: "default" | "home";
}

export default function Post({
  post,
  thumbnail,
  direction,
  pathPrefix = "blog",
  variant = "default",
}: PostProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const isHomeCard = variant === "home";

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (direction !== "column" || isHomeCard) return;

    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    setRotation({
      x: ((y - centerY) / centerY) * -2.5,
      y: ((x - centerX) / centerX) * 2.5,
    });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const shouldApplyTilt = direction === "column" && !isHomeCard;
  const category = pathPrefix === "learn" ? "Course" : pathPrefix === "explainers" ? "Explainer" : "Article";

  return (
    <Card
      className={`post-3d-card${isHomeCard ? " post-home-card" : ""}`}
      fillWidth
      key={post.slug}
      href={post.metadata.link || `/${pathPrefix}/${post.slug}`}
      transition="micro-medium"
      direction={direction}
      border={isHomeCard ? "neutral-alpha-weak" : "neutral-medium"}
      background={isHomeCard ? "surface" : "transparent"}
      padding={isHomeCard ? "8" : "4"}
      radius="l-4"
      gap={direction === "column" ? undefined : "24"}
      s={{ direction: "column" }}
      {...(shouldApplyTilt && {
        onMouseMove: handleMouseMove,
        onMouseLeave: handleMouseLeave,
        style: {
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: "transform 0.1s ease-out",
        },
      })}
    >
      {post.metadata.image && thumbnail && (
        <Media
          priority={!isHomeCard}
          sizes="(max-width: 768px) 100vw, 640px"
          border="neutral-alpha-weak"
          cursor="interactive"
          radius="l"
          src={post.metadata.image}
          alt={`Thumbnail of ${post.metadata.title}`}
          aspectRatio={isHomeCard ? "16 / 10" : "16 / 9"}
        />
      )}

      <Row fillWidth>
        <Column
          className={isHomeCard ? "post-home-content" : undefined}
          paddingY={isHomeCard ? "20" : "24"}
          paddingX={isHomeCard ? "16" : "l"}
          gap={isHomeCard ? "16" : "20"}
          vertical="center"
          fillWidth
        >
          {isHomeCard ? (
            <Row className="post-home-meta" fillWidth horizontal="between" vertical="center" gap="16">
              <Text variant="label-strong-xs" onBackground="brand-weak">
                {category}
              </Text>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {formatDate(post.metadata.publishedAt, false)}
              </Text>
            </Row>
          ) : (
            <Row gap="24" vertical="center">
              <Row vertical="center" gap="16">
                <Avatar src={person.avatar} size="s" />
                <Text variant="label-default-s">{person.name}</Text>
              </Row>
              <Text variant="body-default-xs" onBackground="neutral-weak">
                {formatDate(post.metadata.publishedAt, false)}
              </Text>
            </Row>
          )}

          <Column gap="8" fillWidth>
            <Text variant={isHomeCard ? "heading-strong-l" : "heading-strong-l"} wrap="balance">
              {post.metadata.title}
            </Text>
            {post.metadata.summary && (
              <SmartTruncate
                as={Text}
                variant={isHomeCard ? "body-default-s" : "body-default-m"}
                onBackground="neutral-weak"
              >
                {post.metadata.summary}
              </SmartTruncate>
            )}
          </Column>

          {post.metadata.topics && post.metadata.topics.length > 0 && (
            <Row gap="8" wrap>
              {post.metadata.topics.slice(0, isHomeCard ? 2 : undefined).map((topic: string, index: number) => (
                <Row key={index} background="neutral-alpha-weak" radius="m" paddingX="8" paddingY="4">
                  <Text variant="label-default-s">{topic}</Text>
                </Row>
              ))}
            </Row>
          )}

          {isHomeCard ? (
            <Row className="post-home-footer" fillWidth horizontal="between" vertical="center">
              <Text variant="label-strong-s" onBackground="neutral-weak">
                Read {category.toLowerCase()}
              </Text>
              <span aria-hidden="true">↗</span>
            </Row>
          ) : (
            post.metadata.tag && (
              <Text variant="label-strong-s" onBackground="neutral-weak">
                {post.metadata.tag}
              </Text>
            )
          )}
        </Column>
      </Row>
    </Card>
  );
}
