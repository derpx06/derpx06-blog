"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Flex, IconButton, Row, useTheme } from "@once-ui-system/core";
import { CourseSidebar } from "@/components/CourseSidebar";
import { CourseContent } from "@/components/CourseContent";
import styles from "@/components/Header.module.scss";
import { useScrollDirection } from "@/hooks/useScrollDirection";

import { Course } from "@/resources/courses";

interface CourseMobileControlsProps {
    course: Course;
    children: React.ReactNode;
}

export default function CourseMobileControls({ course, children }: CourseMobileControlsProps) {
    const { theme } = useTheme();
    const [activePanel, setActivePanel] = useState<"menu" | "search" | null>(null);
    const [currentTheme, setCurrentTheme] = useState("light");
    const scrollDirection = useScrollDirection();
    const shouldHide = scrollDirection === "down" && activePanel !== "menu";

    useEffect(() => {
        setCurrentTheme(document.documentElement.getAttribute("data-theme") || "light");
    }, [theme]);

    const toggleMenu = () => {
        setActivePanel((prev) => (prev === "menu" ? null : "menu"));
    };

    const closePanel = () => {
        setActivePanel(null);
    };

    return (
        <Flex fillWidth style={{ minHeight: "100vh" }} direction="column">
            {/* Fixed menu button for mobile */}
            <Row
                position="fixed"
                left="0"
                fillWidth
                paddingX="12"
                paddingY="8"
                horizontal="between"
                vertical="center"
                hide
                s={{ hide: false, top: "0" }}
                m={{ hide: false, top: "0", style: { paddingLeft: "80px", height: "80px" } }}
                style={{
                    zIndex: 30,
                    pointerEvents: "none",
                    transition: "transform 0.3s ease-in-out",
                    transform: shouldHide ? "translateY(-100%)" : "translateY(0)"
                }}
                className={styles.compactHeader}
            >
                {activePanel === "menu" ? (
                    <IconButton
                        icon="close"
                        variant="secondary"
                        size="m"
                        tooltip="Close Menu"
                        onClick={toggleMenu}
                        style={{ backdropFilter: "blur(4px)", pointerEvents: "auto" }}
                    />
                ) : (
                    <IconButton
                        variant="secondary"
                        size="m"
                        tooltip="Menu"
                        onClick={toggleMenu}
                        style={{ backdropFilter: "blur(4px)", pointerEvents: "auto" }}
                    >
                        <Image
                            src={
                                currentTheme === "dark"
                                    ? "/svg/menu-alt-1-svgrepo-com-white.svg"
                                    : "/svg/menu-alt-1-svgrepo-com.svg"
                            }
                            alt="Menu"
                            width={24}
                            height={24}
                        />
                    </IconButton>
                )}
            </Row>

            {/* Backdrop overlay when menu is open */}
            {activePanel === "menu" && (
                <div
                    style={{
                        position: "fixed",
                        inset: 0,
                        zIndex: 35,  // Higher than controls (30) but lower than sidebar (40)
                        backgroundColor: "rgba(0, 0, 0, 0.3)",  // Visible backdrop
                        pointerEvents: "none"  // Allow clicks to pass through to sidebar
                    }}
                />
            )}

            {/* Main content area with sidebar and content */}
            <Flex fillWidth flex={1} direction="row" position="relative">
                <CourseSidebar
                    course={course}
                    mobileOpen={activePanel === "menu"}
                    onClose={closePanel}
                />
                <CourseContent>{children}</CourseContent>
            </Flex>
        </Flex>
    );
}
