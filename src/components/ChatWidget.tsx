"use client";

import { IconButton, Flex, Column, Input, Text } from "@once-ui-system/core";
import { useState, useEffect } from "react";
import { AiIcon } from "./icons/AiIcon";
import styles from "./ChatWidget.module.scss";
import { useScrollDirection } from "@/hooks/useScrollDirection";

export const ChatWidget = ({ variant = "bubble" }: { variant?: "bubble" | "inline" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const scrollDirection = useScrollDirection();
    const shouldHide = variant === "bubble" && !isOpen && scrollDirection === "down";

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string }[]>([
        {
            role: "assistant",
            text: "Hello! I am your AI assistant. How can I help you learn today?",
        },
    ]);

    const handleSend = () => {
        if (!input.trim()) return;

        setMessages((prev) => [...prev, { role: "user", text: input }]);
        setInput("");

        setTimeout(() => {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", text: "I'm just a demo widget for now, but I'm listening!" },
            ]);
        }, 1000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };

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
            {isOpen && (
                <>
                    <div
                        onClick={() => setIsOpen(false)}
                        style={{
                            position: "fixed",
                            inset: 0,
                            zIndex: 49,
                            display: "none",
                        }}
                        className="chatbot-overlay"
                    />
                    <Column
                        position="fixed"
                        bottom="104"
                        right="32"
                        style={{
                            zIndex: 50,
                            width: "440px",
                            maxWidth: "calc(100vw - 32px)",
                            maxHeight: "min(650px, calc(100dvh - 40px))",
                            animation: "slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        }}
                        s={{
                            bottom: "20",
                            right: "16",
                        }}
                        m={{
                            bottom: "24",
                            right: "24",
                        }}
                        background="surface"
                        border="neutral-medium"
                        radius="l"
                        shadow="l"
                        overflow="hidden"
                    >
                        <Flex
                            fillWidth
                            padding="16"
                            borderBottom="neutral-medium"
                            background="surface"
                            vertical="center"
                            horizontal="between"
                        >
                            <Text variant="heading-strong-s">Chat AI</Text>
                            <IconButton
                                icon="close"
                                size="s"
                                variant="ghost"
                                onClick={() => setIsOpen(false)}
                                tooltip="Close"
                            />
                        </Flex>

                        <Flex
                            fillWidth
                            flex={1}
                            padding="16"
                            background="page"
                            direction="column"
                            gap="12"
                            style={{ overflowY: "auto" }}
                        >
                            {messages.map((msg, index) => (
                                <Flex
                                    key={index}
                                    style={{
                                        alignSelf: msg.role === "assistant" ? "flex-start" : "flex-end",
                                        maxWidth: "85%",
                                    }}
                                >
                                    <Flex
                                        padding="12"
                                        gap="12"
                                        radius="m"
                                        background={
                                            msg.role === "assistant"
                                                ? "neutral-alpha-weak"
                                                : "brand-medium"
                                        }
                                    >
                                        {msg.role === "assistant" && (
                                            <Flex style={{ minWidth: "24px" }}>
                                                <AiIcon size={24} />
                                            </Flex>
                                        )}
                                        <Text
                                            variant="body-default-s"
                                            onBackground={
                                                msg.role === "assistant"
                                                    ? "neutral-strong"
                                                    : "neutral-weak"
                                            }
                                            style={{
                                                wordBreak: "break-word",
                                                overflowWrap: "anywhere",
                                            }}
                                        >
                                            {msg.text}
                                        </Text>
                                    </Flex>
                                </Flex>
                            ))}
                        </Flex>

                        <Flex
                            fillWidth
                            padding="16"
                            background="surface"
                            gap="8"
                            vertical="center"
                        >
                            <Input
                                id="chat-input"
                                name="chat-input"
                                label="Type a message..."
                                width="full"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                autoComplete="off"
                            />
                            <IconButton
                                icon="arrowRight"
                                size="m"
                                variant="tertiary"
                                tooltip="Send"
                                onClick={handleSend}
                                disabled={!input.trim()}
                            />
                        </Flex>
                    </Column>
                </>
            )}

            <Flex
                position={variant === "bubble" ? "fixed" : "static"}
                bottom={variant === "bubble" ? "32" : undefined}
                right={variant === "bubble" ? "32" : undefined}
                style={{
                    zIndex: 50,
                    transition: "transform 0.3s ease-in-out, opacity 0.3s ease-in-out",
                    transform: shouldHide ? "translateY(200%)" : "translateY(0)",
                    opacity: shouldHide ? 0 : 1,
                    pointerEvents: shouldHide ? "none" : "auto",
                }}
                s={
                    variant === "bubble"
                        ? {
                            bottom: "24",
                            right: "16",
                        }
                        : undefined
                }
                m={
                    variant === "bubble"
                        ? {
                            bottom: "24",
                            right: "16",
                        }
                        : undefined
                }
            >
                {isOpen ? (
                    <IconButton
                        icon="close"
                        size="m"
                        variant="primary"
                        tooltip="Close Chat"
                        onClick={() => setIsOpen(false)}
                        style={{ borderRadius: "50%", width: "48px", height: "48px" }}
                    />
                ) : (
                    <Flex
                        className={variant === "bubble" ? styles.trigger : undefined}
                        onClick={() => setIsOpen(true)}
                        vertical="center"
                        horizontal="center"
                        background="surface"
                        border="neutral-medium"
                        shadow={variant === "bubble" ? "l" : undefined}
                        radius="l"
                        padding="4"
                        style={{
                            cursor: "pointer",
                            borderRadius: "50%",
                            width: variant === "inline" ? "40px" : "48px",
                            height: variant === "inline" ? "40px" : "48px",
                        }}
                    >
                        <AiIcon size={variant === "inline" ? 20 : 24} />
                    </Flex>
                )}
            </Flex>
            <style jsx global>{`
                @keyframes slideUp {
                    from {
                        transform: translateY(20px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                @media (max-width: 768px) {
                    .chatbot-overlay {
                        display: block !important;
                        background: rgba(0, 0, 0, 0.5);
                    }
                }
            `}</style>
        </>
    );
};
