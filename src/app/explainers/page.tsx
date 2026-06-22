import { Column, Heading, Meta, Schema } from "@once-ui-system/core";
import { Mailchimp } from "@/components";
import { Posts } from "@/components/blog/Posts";
import { baseURL, explainers, person } from "@/resources";

export async function generateMetadata() {
    return Meta.generate({
        title: explainers.title,
        description: explainers.description,
        baseURL: baseURL,
        image: `/api/og/generate?title=${encodeURIComponent(explainers.title)}`,
        path: explainers.path,
    });
}

export default function Explainers() {
    return (
        <Column maxWidth="m" paddingTop="24">
            <Schema
                as="blogPosting"
                baseURL={baseURL}
                title={explainers.title}
                description={explainers.description}
                path={explainers.path}
                image={`/api/og/generate?title=${encodeURIComponent(explainers.title)}`}
                author={{
                    name: person.name,
                    url: `${baseURL}/explainers`,
                    image: `${baseURL}${person.avatar}`,
                }}
            />
            <Heading as="h1" marginBottom="l" variant="heading-strong-xl" marginLeft="24">
                {explainers.title}
            </Heading>
            <Column fillWidth flex={1} gap="40">
                <Posts
                    range={[1]}
                    thumbnail
                    source={["src", "app", "explainers", "posts"]}
                    pathPrefix="explainers"
                />
                <Posts
                    range={[2, 10]}
                    columns="2"
                    thumbnail
                    direction="column"
                    source={["src", "app", "explainers", "posts"]}
                    pathPrefix="explainers"
                />
            </Column>
        </Column>
    );
}
