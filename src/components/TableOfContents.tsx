"use client";

import { useEffect, useState } from "react";
import { Flex, Text, SmartLink } from "@once-ui-system/core";

export function TableOfContents() {
    const [activeId, setActiveId] = useState<string>("");
    const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);

    useEffect(() => {
        const elements = Array.from(document.querySelectorAll("h2, h3"));
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

    return (
        <Flex direction="column" gap="8">
            {headings.map((heading) => (
                <SmartLink
                    key={heading.id}
                    href={`#${heading.id}`}
                    style={{
                        textDecoration: "none",
                        marginLeft: heading.level === 3 ? "12px" : "0px"
                    }}
                >
                    <Text
                        variant="label-default-s"
                        onBackground={activeId === heading.id ? "brand-medium" : "neutral-medium"}
                        style={{ fontWeight: activeId === heading.id ? 600 : 400 }}
                    >
                        {heading.text}
                    </Text>
                </SmartLink>
            ))}
        </Flex>
    );
}
