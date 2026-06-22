import { notFound } from "next/navigation";
import { CustomMDX, ScrollToHash } from "@/components";
import {
    Meta,
    Schema,
    Column,
    Heading,
    HeadingNav,
    Icon,
    Row,
    Text,
    SmartLink,
    Avatar,
    Media,
    Line,
} from "@once-ui-system/core";
import { baseURL, about, explainers, person } from "@/resources";
import { formatDate } from "@/utils/formatDate";
import { getPosts } from "@/utils/utils";
import { Metadata } from "next";
import React from "react";
import { Posts } from "@/components/blog/Posts";
import { ShareSection } from "@/components/blog/ShareSection";

export async function generateStaticParams(): Promise<{ slug: string }[]> {
    const posts = getPosts(["src", "app", "explainers", "posts"]);
    return posts.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const routeParams = await params;
    const slug = routeParams.slug;

    const posts = getPosts(["src", "app", "explainers", "posts"]);
    let post = posts.find((post) => post.slug === slug);

    if (!post) return {};

    const image = post.metadata.image || `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`;
    const path = `${explainers.path}/${post.slug}`;
    const canonicalUrl = `${baseURL}${path}`;

    const baseMeta = Meta.generate({
        title: post.metadata.title,
        description: post.metadata.summary,
        baseURL: baseURL,
        image,
        path,
    });

    return {
        ...baseMeta,
        alternates: {
            canonical: canonicalUrl,
        },
        openGraph: {
            type: "article",
            title: post.metadata.title,
            description: post.metadata.summary,
            url: canonicalUrl,
            images: [image],
        },
        twitter: {
            card: "summary_large_image",
            title: post.metadata.title,
            description: post.metadata.summary,
            images: [image],
        },
    };
}

export default async function ExplainerPost({ params }: { params: Promise<{ slug: string }> }) {
    const routeParams = await params;
    const slug = routeParams.slug;

    let post = getPosts(["src", "app", "explainers", "posts"]).find((post) => post.slug === slug);

    if (!post) {
        notFound();
    }

    return (
        <Row fillWidth>
            <Row maxWidth={12} m={{ hide: true }} />
            <Row fillWidth horizontal="center">
                <Column as="section" maxWidth="m" horizontal="center" gap="l" paddingTop="24">
                    <Schema
                        as="blogPosting"
                        baseURL={baseURL}
                        path={`${explainers.path}/${post.slug}`}
                        title={post.metadata.title}
                        description={post.metadata.summary}
                        datePublished={post.metadata.publishedAt}
                        dateModified={post.metadata.publishedAt}
                        image={
                            post.metadata.image ||
                            `/api/og/generate?title=${encodeURIComponent(post.metadata.title)}`
                        }
                        author={{
                            name: person.name,
                            url: `${baseURL}${about.path}`,
                            image: `${baseURL}${person.avatar}`,
                        }}
                    />
                    <Column maxWidth="s" gap="16" horizontal="center" align="center">
                        <SmartLink href="/explainers">
                            <Text variant="label-strong-m">Explainers</Text>
                        </SmartLink>
                        <Text variant="body-default-xs" onBackground="neutral-weak" marginBottom="12">
                            {post.metadata.publishedAt && formatDate(post.metadata.publishedAt)}
                        </Text>
                        <Heading as="h1" variant="display-strong-m">{post.metadata.title}</Heading>
                    </Column>
                    <Row marginBottom="32" horizontal="center">
                        <Row gap="16" vertical="center">
                            <Avatar size="s" src={person.avatar} />
                            <Text variant="label-default-m" onBackground="brand-weak">
                                {person.name}
                            </Text>
                        </Row>
                    </Row>
                    {post.metadata.image && require("fs").existsSync(require("path").join(process.cwd(), "public", post.metadata.image)) && (
                        <Media
                            src={post.metadata.image}
                            alt={post.metadata.title}
                            aspectRatio="16/9"
                            priority
                            sizes="(min-width: 768px) 100vw, 768px"
                            border="neutral-alpha-weak"
                            radius="l"
                            marginTop="12"
                            marginBottom="8"
                        />
                    )}
                    <Column as="article" maxWidth="s">
                        <CustomMDX source={post.content} />
                    </Column>

                    <ShareSection
                        title={post.metadata.title}
                        url={`${baseURL}${explainers.path}/${post.slug}`}
                    />

                    <Column fillWidth gap="40" horizontal="center" marginTop="40">
                        <Line maxWidth="40" />
                        <Heading as="h2" variant="heading-strong-xl" marginBottom="24">
                            More Explainers
                        </Heading>
                        <Posts
                            exclude={[post.slug]}
                            range={[1, 4]}
                            columns="2"
                            thumbnail
                            direction="column"
                            source={["src", "app", "explainers", "posts"]}
                            pathPrefix="explainers"
                        />
                    </Column>
                    <ScrollToHash />
                </Column>
            </Row>
            <Column
                maxWidth={16}
                paddingLeft="40"
                fitHeight
                position="sticky"
                top="80"
                gap="16"
                m={{ hide: true }}
                className="sticky-sidebar"
            >
                <Row
                    gap="12"
                    paddingLeft="2"
                    vertical="center"
                    onBackground="neutral-medium"
                    textVariant="label-default-s"
                >

                </Row>
                <HeadingNav fitHeight />
            </Column>
        </Row>
    );
}
