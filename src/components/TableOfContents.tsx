"use client";

import { useEffect, useState } from "react";
import { Flex, Text, SmartLink, Icon } from "@once-ui-system/core";
import { SmartTruncate } from "@/components/SmartTruncate";

export function TableOfContents() {
    const [activeId, setActiveId] = useState<string>("");
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

    useEffect(() => {
        const elements = Array.from(document.querySelectorAll("article h1, article h3"));
        const mappedHeadings = elements.map((element) => ({
            id: element.id,
            text: (element as HTMLElement).innerText,
            level: Number(element.tagName.substring(1)),
        }));
        setHeadings(mappedHeadings);

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: "0px 0px -80% 0px" }
        );

        elements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, []);

    if (headings.length === 0) return null;

    return (
        <Flex
            direction="column"
            gap="16"
            fillWidth
        >
            <Flex gap="8" vertical="center" marginBottom="4">
                <Icon name="list" size="s" onBackground="neutral-weak" />
                <Text variant="label-default-s" onBackground="neutral-weak">
                    On this page
                </Text>
            </Flex>

            <Flex direction="column" gap="4" fillWidth minWidth={0}>
                {headings.map((heading) => {
                    const isActive = activeId === heading.id;
                    return (
                        <SmartLink
                            key={heading.id}
                            href={`#${heading.id}`}
                            style={{
                                textDecoration: "none",
                                display: "block",
                                width: "100%",
                                margin: "0",
                                marginLeft: heading.level === 3 ? "12px" : "0px",
                            }}
                        >
                            <Flex
                                vertical="center"
                                paddingX="12"
                                paddingY="8"
                                radius="m"
                                background={isActive ? "neutral-alpha-medium" : undefined}
                                style={{
                                    borderLeft: isActive ? "2px solid var(--brand-solid-strong)" : "2px solid transparent",
                                    transition: "background 0.2s ease, border 0.2s ease",
                                    cursor: "pointer",
                                    // overflow: "hidden" removed to prevent checking ellipsis
                                }}
                                fillWidth
                                minWidth={0}
                            >
                                <SmartTruncate
                                    as={Text}
                                    variant="label-default-s"
                                    onBackground={isActive ? "neutral-strong" : "neutral-medium"}
                                    lines={1}
                                    style={{
                                        fontWeight: isActive ? 600 : 400,
                                        transition: "color 0.2s ease",
                                        display: "block",
                                        maxWidth: "100%"
                                    }}
                                >
                                    {heading.text}
                                </SmartTruncate>
                            </Flex>
                        </SmartLink>
                    );
                })}
            </Flex>
        </Flex >
    );
}
