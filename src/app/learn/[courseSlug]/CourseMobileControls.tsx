"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { Flex, IconButton, Row, useTheme } from "@once-ui-system/core";
import { CourseSidebar } from "@/components/CourseSidebar";
import { CourseContent } from "@/components/CourseContent";
import styles from "@/components/Header.module.scss";

import { Course } from "@/resources/courses";

interface CourseMobileControlsProps {
    course: Course;
    children: React.ReactNode;
}

export default function CourseMobileControls({ course, children }: CourseMobileControlsProps) {
    const { theme } = useTheme();
    const [activePanel, setActivePanel] = useState<'menu' | 'search' | null>(null);
    const [currentTheme, setCurrentTheme] = useState("light");

    useEffect(() => {
        setCurrentTheme(document.documentElement.getAttribute("data-theme") || "light");
    }, [theme]);

    const toggleMenu = () => {
        setActivePanel(prev => prev === 'menu' ? null : 'menu');
    };



    const closePanel = () => {
        setActivePanel(null);
    };

    return (
        <Flex fillWidth className="min-h-screen" direction="column">
            <CourseSidebar
                course={course}
                mobileOpen={activePanel === 'menu'}
                onClose={closePanel}
            />

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
                m={{ hide: false, top: "0", paddingLeft: "80px", height: "80" }}
                style={{ zIndex: 30, pointerEvents: "none" }}
            >
                {activePanel === 'menu' ? (
                    <IconButton
                        icon="close"
                        variant="secondary"
                        size="m"
                        tooltip="Close Menu"
                        className={styles.blur}
                        onClick={toggleMenu}
                        style={{ backdropFilter: "blur(12px)", pointerEvents: "auto" }}
                    />
                ) : (
                    <IconButton
                        variant="secondary"
                        size="m"
                        tooltip="Menu"
                        className={styles.blur}
                        onClick={toggleMenu}
                        style={{ backdropFilter: "blur(12px)", pointerEvents: "auto" }}
                    >
                        <Image
                            src={currentTheme === 'dark' ? "/svg/menu-alt-1-svgrepo-com-white.svg" : "/svg/menu-alt-1-svgrepo-com.svg"}
                            alt="Menu"
                            width={24}
                            height={24}
                        />
                    </IconButton>
                )}
            </Row>

            <CourseContent>
                {children}
            </CourseContent>
        </Flex>
    );
}
