"use client";

import React, { useRef, useState, useEffect } from "react";
import { Card, Row, Text, Icon, Button } from "@once-ui-system/core";

interface TimelineItem {
    year: string;
    title: string;
    desc: string;
    icon?: string;
}

interface TimelineProps {
    items?: TimelineItem[];
}

export const Timeline: React.FC<TimelineProps> = ({ items = [] }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    useEffect(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const onWheel = (e: WheelEvent) => {
            // If we are scrolling vertically (deltaY), hijack it for horizontal scroll
            if (e.deltaY !== 0) {
                // Prevent default page scroll
                e.preventDefault();
                container.scrollLeft += e.deltaY;
            }
        };

        // Passive: false is required to allow preventDefault()
        container.addEventListener("wheel", onWheel, { passive: false });

        return () => {
            container.removeEventListener("wheel", onWheel);
        };
    }, []);

    const handleMouseDown = (e: React.MouseEvent) => {
        if (!scrollContainerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
        setScrollLeft(scrollContainerRef.current.scrollLeft);
    };

    const handleMouseLeave = () => {
        setIsDragging(false);
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !scrollContainerRef.current) return;
        e.preventDefault();
        const x = e.pageX - scrollContainerRef.current.offsetLeft;
        const walk = (x - startX) * 2; // Scroll-fast
        scrollContainerRef.current.scrollLeft = scrollLeft - walk;
    };

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = 348; // Card width (300) + Gap (48)
            scrollContainerRef.current.scrollBy({
                left: direction === "right" ? scrollAmount : -scrollAmount,
                behavior: "smooth",
            });
        }
    };

    return (
        <div style={{ position: "relative", width: "100%", padding: "0 16px" }}>
            {/* Left Arrow */}
            <div
                style={{
                    position: "absolute",
                    left: 0,
                    top: "40%",
                    zIndex: 10,
                    transform: "translateY(-50%)",
                }}
            >
                <Button
                    onClick={() => scroll("left")}
                    variant="tertiary"
                    size="s"
                >
                    <Icon name="chevronLeft" size="m" />
                </Button>

            </div>

            {/* Right Arrow */}
            <div
                style={{
                    position: "absolute",
                    right: 0,
                    top: "40%",
                    zIndex: 10,
                    transform: "translateY(-50%)",
                }}
            >
                <Button
                    onClick={() => scroll("right")}
                    variant="tertiary"
                    size="s"
                >
                    <Icon name="chevronRight" size="m" />
                </Button>
            </div>

            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                onMouseDown={handleMouseDown}
                onMouseLeave={handleMouseLeave}
                onMouseUp={handleMouseUp}
                onMouseMove={handleMouseMove}
                style={{
                    display: "flex",
                    overflowX: "auto",
                    gap: "48px", // Increased gap for longer descriptions
                    padding: "24px 48px", // Side padding to key content away from edge arrows
                    cursor: isDragging ? "grabbing" : "grab",
                    scrollbarWidth: "none", // Firefox
                    msOverflowStyle: "none", // IE/Edge
                    userSelect: "none",
                    // CRITICAL FIX: Disable snap during drag to prevent fighting
                    scrollSnapType: isDragging ? "none" : "x mandatory",
                    scrollBehavior: isDragging ? "auto" : "smooth",
                }}
                className="no-scrollbar"
            >
                <style jsx>{`
            div::-webkit-scrollbar {
                display: none;
            }
        `}</style>

                {items.map((item, index, arr) => (
                    <div
                        key={index}
                        style={{
                            minWidth: "300px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            position: "relative",
                            scrollSnapAlign: "center",
                        }}
                    >
                        {/* Card Popup */}
                        <Card
                            padding="24"
                            radius="l"
                            direction="column"
                            border="neutral-medium"
                            background="surface"
                            style={{
                                position: "relative",
                                marginBottom: "36px",
                                width: "100%",
                                pointerEvents: "none", // Let clicks pass through to drag
                            }}
                        >
                            <Row gap="12" vertical="center" marginBottom="8">
                                <Icon name={item.icon || "sparkle"} size="m" />
                                <Text variant="heading-strong-s">{item.title}</Text>
                            </Row>
                            <Text variant="body-default-s" onBackground="neutral-weak">
                                {item.desc}
                            </Text>

                            {/* Arrow Triangle */}
                            <div
                                style={{
                                    position: "absolute",
                                    bottom: "-8px",
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    width: "0",
                                    height: "0",
                                    borderLeft: "8px solid transparent",
                                    borderRight: "8px solid transparent",
                                    borderTop:
                                        "8px solid var(--neutral-border-medium, #e5e5e5)",
                                }}
                            ></div>
                        </Card>

                        {/* Timeline Node */}
                        <div
                            style={{
                                width: "12px",
                                height: "12px",
                                borderRadius: "50%",
                                background: "var(--neutral-on-background-strong, #333)",
                                zIndex: 2,
                                marginBottom: "16px",
                                border: "2px solid var(--background-surface, #fff)",
                                flexShrink: 0,
                            }}
                        ></div>

                        {/* Line Segment */}
                        <div style={{
                            position: "absolute",
                            bottom: "42px",
                            left: index === 0 ? "50%" : "0",
                            right: index === arr.length - 1 ? "50%" : "-48px",
                            height: "2px",
                            background: "var(--neutral-border-medium, #e5e5e5)",
                            zIndex: 1
                        }} />


                        {/* Year Label */}
                        <Text
                            variant="label-default-s"
                            onBackground="neutral-strong"
                        >
                            {item.year}
                        </Text>
                    </div>
                ))}
            </div>
        </div>
    );
};
