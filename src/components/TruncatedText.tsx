"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Text, Button, Flex, IconButton, Icon } from "@once-ui-system/core";

interface TruncatedTextProps {
    children: string;
    lines?: number;
    variant?: string; // To match Text variant prop
    onBackground?: string;
    className?: string;
    style?: React.CSSProperties;
}

export default function TruncatedText({
    children,
    lines = 2,
    variant = "body-default-m",
    onBackground,
    className,
    style,
}: TruncatedTextProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        setIsOpen(true);
    };

    const handleClose = (e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        setIsOpen(false);
    };

    // Prevent scrolling when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    return (
        <>
            <Text
                variant={variant as any}
                onBackground={onBackground}
                className={className}
                style={{
                    ...style,
                    display: "-webkit-box",
                    WebkitLineClamp: lines,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                    cursor: "pointer",
                }}
                onClick={handleClick}
            >
                {children}
            </Text>

            {isOpen && isClient && createPortal(
                <div
                    style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        zIndex: 9999,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "20px",
                    }}
                    onClick={handleClose}
                >
                    <div
                        style={{
                            backgroundColor: "var(--background)", // Assuming standard CSS variable or verify
                            border: "1px solid var(--neutral-border-medium)",
                            padding: "32px",
                            borderRadius: "12px",
                            maxWidth: "600px",
                            width: "100%",
                            maxHeight: "80vh",
                            overflowY: "auto",
                            position: "relative",
                        }}
                        onClick={(e) => e.stopPropagation()} // Prevent close on content click
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                marginBottom: "16px",
                            }}
                        >
                            <Button
                                onClick={handleClose}
                                variant="tertiary"
                                size="s"
                            >
                                Close
                            </Button>
                        </div>
                        <Text
                            variant={variant as any}
                            onBackground={onBackground}
                            style={{ whiteSpace: "pre-wrap" }}
                        >
                            {children}
                        </Text>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
