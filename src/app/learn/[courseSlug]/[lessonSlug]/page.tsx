import { notFound } from "next/navigation";
import { CustomMDX } from "@/components";
import {
    Meta,
    Schema,
    Column,
    Heading,
    Icon,
    Text,
    Avatar,
    Row,
    Media,
    Button,
} from "@once-ui-system/core";
import { TableOfContents } from "@/components";
import { baseURL, about, person } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import { getPosts } from "@/utils/utils";
import { Metadata } from "next";
import { courses } from "@/resources/courses";
import { cache } from "react";

const getPostsCached = cache(getPosts);

export const dynamicParams = false;

// Helper to flatten course links for navigation
const getCourseLinks = (course: any) => {
    return course.topics.flatMap((topic: any) => topic.links);
};

export async function generateStaticParams() {
    const params = [];
    for (const course of courses) {
        for (const topic of course.topics) {
            for (const link of topic.links) {
                params.push({
                    courseSlug: course.slug,
                    lessonSlug: link.slug,
                });
            }
        }
    }
    return params;
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ courseSlug: string; lessonSlug: string }>;
}): Promise<Metadata> {
    const { courseSlug, lessonSlug } = await params;
    const course = courses.find((c) => c.slug === courseSlug);
    if (!course) return {};

    const link = getCourseLinks(course).find((l: any) => l.slug === lessonSlug);
    if (!link) return {};

    const posts = getPostsCached(["src", "app", "learn", "posts"]);
    const postStub = link.postSlugs[0];
    const post = posts.find((p) => p.slug === postStub);

    if (!post) return {};

    return Meta.generate({
        title: `${link.title} | ${course.title}`,
        description: post.metadata.summary,
        baseURL: baseURL,
        image: post.metadata.image || `/api/og/generate?title=${encodeURIComponent(link.title)}`,
        path: `/learn/${courseSlug}/${lessonSlug}`,
    });
}

export default async function CourseLesson({
    params,
}: {
    params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
    const { courseSlug, lessonSlug } = await params;
    const course = courses.find((c) => c.slug === courseSlug);
    if (!course) notFound();

    const flatLinks = getCourseLinks(course);
    const linkIndex = flatLinks.findIndex((l: any) => l.slug === lessonSlug);
    const link = flatLinks[linkIndex];

    if (!link) notFound();

    const allPosts = getPostsCached(["src", "app", "learn", "posts"]);
    const lessonPosts = link.postSlugs.map((slug: string) => allPosts.find((p) => p.slug === slug)).filter(Boolean);

    if (lessonPosts.length === 0) {
        notFound();
    }

    const prevLink = linkIndex > 0 ? flatLinks[linkIndex - 1] : null;
    const nextLink = linkIndex < flatLinks.length - 1 ? flatLinks[linkIndex + 1] : null;

    const primaryPost = lessonPosts[0];
    if (!primaryPost) notFound();

    return (
        <Column fillWidth horizontal="center">
            <Row maxWidth="l" s={{ maxWidth: "100%" }} m={{ maxWidth: "100%" }} gap="l">
                <Column maxWidth="m" s={{ maxWidth: "100%" }} m={{ maxWidth: "100%" }} gap="l">
                    <Schema
                        as="blogPosting"
                        baseURL={baseURL}
                        path={`/learn/${courseSlug}/${lessonSlug}`}
                        title={link.title}
                        description={primaryPost.metadata.summary}
                        datePublished={primaryPost.metadata.publishedAt}
                        dateModified={primaryPost.metadata.publishedAt}
                        image={primaryPost.metadata.image}
                        author={{
                            name: person.name,
                            url: `${baseURL}${about.path}`,
                            image: `${baseURL}${person.avatar}`,
                        }}
                    />

                    <Column gap="16">
                        <Text variant="body-default-xs" onBackground="neutral-weak">
                            {course.title} • {primaryPost.metadata.publishedAt && formatDate(primaryPost.metadata.publishedAt)}
                        </Text>
                        <Heading variant="display-strong-m">{link.title}</Heading>
                    </Column>

                    <Row gap="16" vertical="center" marginBottom="24">
                        <Avatar size="s" src={person.avatar} />
                        <Text variant="label-default-m" onBackground="brand-weak">
                            {person.name}
                        </Text>
                    </Row>

                    {primaryPost.metadata.image && (
                        <Media
                            src={primaryPost.metadata.image}
                            alt={link.title}
                            aspectRatio="16/9"
                            priority
                            sizes="(min-width: 768px) 100vw, 768px"
                            border="neutral-alpha-weak"
                            radius="l"
                            marginBottom="32"
                        />
                    )}

                    <Column as="article" maxWidth="s" s={{ maxWidth: "100%" }} m={{ maxWidth: "100%" }}>
                        {lessonPosts.map((post: any, idx: number) => (
                            <CustomMDX key={idx} source={post.content} />
                        ))}
                    </Column>

                    <Row fillWidth gap="16" marginTop="32" horizontal="between">
                        {prevLink ? (
                            <Button
                                href={`/learn/${courseSlug}/${prevLink.slug}`}
                                variant="secondary"
                                size="s"
                                prefixIcon="chevronLeft"
                            >
                                Previous
                            </Button>
                        ) : (
                            <div />
                        )}

                        {nextLink && (
                            <Button
                                href={`/learn/${courseSlug}/${nextLink.slug}`}
                                variant="secondary"
                                size="s"
                                arrowIcon
                            >
                                Next
                            </Button>
                        )}
                    </Row>
                </Column>
                <Column
                    maxWidth={12}
                    paddingLeft="40"
                    fitHeight
                    position="sticky"
                    top="80"
                    gap="16"
                    m={{ hide: true }}
                    s={{ hide: true }}
                >
                    <Row
                        gap="12"
                        paddingLeft="2"
                        vertical="center"
                        onBackground="neutral-medium"
                        textVariant="label-default-s"
                    >
                        <Icon name="document" size="xs" />
                        On this page
                    </Row>
                    <TableOfContents />
                </Column>
            </Row>
        </Column>
    );
}
