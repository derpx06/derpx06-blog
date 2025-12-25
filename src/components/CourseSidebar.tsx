"use client";

import { usePathname } from "next/navigation";
import { Column, Text, SmartLink, Line } from "@once-ui-system/core";
import { Course } from "@/resources/courses";

interface CourseSidebarProps {
    course: Course;
    mobileOpen?: boolean;
    onClose?: () => void;
}

export function CourseSidebar({ course, mobileOpen = false, onClose }: CourseSidebarProps) {
    const pathname = usePathname();
    let globalIndex = 0;

    return (
        <Column
            position="fixed"
            top="104"
            left="32"
            radius="l"
            border="neutral-medium"
            background="surface"
            padding="16"
            gap="8"
            style={{ width: "fit-content", maxHeight: "calc(100vh - 128px)", overflowY: "auto" }}
            zIndex={10}
            s={{
                hide: !mobileOpen,
                ...(mobileOpen ? {
                    display: "flex",
                    position: "fixed",
                    top: "0",
                    left: "0",
                    width: "85%",
                    maxWidth: "320px",
                    height: "100%",
                    zIndex: 20,
                    background: "page",
                    border: "neutral-medium",
                    radius: "none",
                    padding: "24",
                    overflowY: "auto"
                } : {})
            }}
            m={{
                hide: !mobileOpen,
                ...(mobileOpen ? {
                    display: "flex",
                    position: "fixed",
                    top: "0",
                    left: "0",
                    width: "85%",
                    maxWidth: "320px",
                    height: "100%",
                    zIndex: 20,
                    background: "page",
                    border: "neutral-medium",
                    radius: "none",
                    padding: "24",
                    overflowY: "auto"
                } : {})
            }}
        >
            <Text variant="heading-strong-s" marginBottom="16" paddingX="8">
                {course.title}
            </Text>

            <Column fillWidth gap="24">
                {course.topics.map((topic, topicIndex) => (
                    <Column key={topicIndex} fillWidth gap="8">
                        {topicIndex > 0 && <Line background="neutral-alpha-medium" />}
                        <Text
                            variant="label-strong-s"
                            onBackground="neutral-weak"
                            paddingX="8"
                            marginTop={topicIndex > 0 ? "8" : "0"}
                        >
                            {topic.title}
                        </Text>
                        <Column fillWidth gap="4">
                            {topic.links.map((link) => {
                                const index = globalIndex++;
                                const isActive = pathname?.replace(/\/$/, '') === `/learn/${course.slug}/${link.slug}`.replace(/\/$/, '');
                                return (
                                    <SmartLink
                                        key={link.slug}
                                        href={`/learn/${course.slug}/${link.slug}`}
                                        style={{ textDecoration: "none" }}
                                        onClick={onClose}
                                    >
                                        <Column
                                            fillWidth
                                            paddingX="12"
                                            paddingY="8"
                                            radius="m"
                                            background={isActive ? "surface" : "transparent"}
                                            border={isActive ? "neutral-alpha-medium" : "transparent"}
                                        >
                                            <Text
                                                variant="label-default-s"
                                                onBackground={isActive ? "brand-medium" : "neutral-medium"}
                                            >
                                                {index + 1}. {link.title}
                                            </Text>
                                        </Column>
                                    </SmartLink>
                                );
                            })}
                        </Column>
                    </Column>
                ))}
            </Column>
        </Column>
    );
}
