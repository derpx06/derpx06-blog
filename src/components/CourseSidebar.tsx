"use client";

import { usePathname } from "next/navigation";
import { Column, Text, SmartLink, Line, Row, IconButton } from "@once-ui-system/core";
import { useEffect, useRef } from "react";
import { Course } from "@/resources/courses";

interface CourseSidebarProps {
    course: Course;
    mobileOpen?: boolean;
    onClose?: () => void;
}

export function CourseSidebar({ course, mobileOpen = false, onClose }: CourseSidebarProps) {
    const pathname = usePathname();
    const pendingNavigationRef = useRef<string | null>(null);

    useEffect(() => {
        if (pendingNavigationRef.current && pathname.includes(pendingNavigationRef.current)) {
            pendingNavigationRef.current = null;
            onClose?.();
        }
    }, [pathname, onClose]);
    let globalIndex = 0;

    return (
        <Column
            radius="l"
            border="neutral-medium"
            background="surface"
            padding="16"
            gap="8"
            style={{
                width: "16rem",
                maxHeight: "calc(100vh - 128px)",
                overflowY: "auto",
                transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out"
            }}
            zIndex={10}
            // Desktop: sticky positioning
            l={{
                position: "sticky",
                top: "104",
                alignSelf: "flex-start",
                width: "16rem",
                maxHeight: "calc(100vh - 128px)",
                background: "surface",
                border: "neutral-medium",
                radius: "l",
                padding: "16",
                overflowY: "auto",
            }}
            // Mobile: fixed overlay
            s={{
                position: "fixed",
                top: "56",
                bottom: "120",
                left: "0",
                width: "85%",
                maxWidth: "320px",
                maxHeight: "calc(100vh - 136px)",
                zIndex: 40,
                background: "page",
                border: "neutral-medium",
                radius: "none",
                padding: "24",
                overflowY: "auto",
            }}
            m={{
                position: "fixed",
                top: "80",
                bottom: "80",
                left: "0",
                width: "85%",
                maxWidth: "320px",
                maxHeight: "calc(100vh - 160px)",
                zIndex: 40,
                background: "page",
                border: "neutral-medium",
                radius: "none",
                padding: "24",
                overflowY: "auto",
            }}
            className={mobileOpen ? "mobile-sidebar-open" : "mobile-sidebar-closed"}
        >
            <style jsx global>{`
                .mobile-sidebar-closed {
                    @media (max-width: 1024px) {
                        transform: translateX(-100%);
                        opacity: 0;
                        pointer-events: none;
                    }
                }
                .mobile-sidebar-open {
                    @media (max-width: 1024px) {
                        transform: translateX(0);
                        opacity: 1;
                        pointer-events: auto;
                    }
                }
            `}</style>

            <Row fillWidth horizontal="between" vertical="center" marginBottom="16" paddingX="8">
                <Text variant="heading-strong-s">
                    {course.title}
                </Text>
                <Row hide s={{ hide: false }} m={{ hide: false }}>
                    <IconButton
                        icon="close"
                        size="m"
                        variant="ghost"
                        tooltip="Close Menu"
                        onClick={onClose}
                    />
                </Row>
            </Row>

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

                                const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
                                    pendingNavigationRef.current = link.slug;
                                };

                                return (
                                    <SmartLink
                                        key={link.slug}
                                        href={`/learn/${course.slug}/${link.slug}`}
                                        style={{ textDecoration: "none" }}
                                        onClick={handleLinkClick}
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
