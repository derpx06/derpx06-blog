"use client";

import { usePathname } from "next/navigation";
import { Column, Text, SmartLink, Line, Row, IconButton } from "@once-ui-system/core";
import { useEffect, useRef } from "react";
import { Course } from "@/resources/courses";
import { SmartTruncate } from "@/components/SmartTruncate";

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
            paddingLeft="16"
            paddingRight="12"
            paddingY="16"
            gap="8"
            style={{
                width: "17rem",
                maxHeight: "calc(100vh - 128px)",
                overflowY: "auto",
                overflowX: "hidden",
                transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out"
            }}
            zIndex={10}
            // Desktop: sticky positioning
            className={`${mobileOpen ? "mobile-sidebar-open" : "mobile-sidebar-closed"} desktop-sidebar`}
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
                overflowX: "hidden",
            }}
            m={{
                position: "fixed",
                top: "30",
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
                overflowX: "hidden",
            }}
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
                
                @media (min-width: 1025px) {
                    .desktop-sidebar {
                        position: fixed !important;
                        top: 60px;
                        align-self: flex-start;
                        width: 17rem;
                        max-height: calc(100vh - 128px);
                        padding: 16px;
                        overflow-y: auto;
                        overflow-x: hidden;
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
                                            radius="l"
                                            background={isActive ? "surface" : "transparent"}
                                            border={isActive ? "neutral-alpha-medium" : "transparent"}
                                            marginRight={isActive ? "4" : "0"}
                                        >
                                            <SmartTruncate
                                                variant="label-default-s"
                                                onBackground={isActive ? "brand-medium" : "neutral-medium"}
                                                lines={1}
                                            >
                                                {`${index + 1}. ${link.title}`}
                                            </SmartTruncate>
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
