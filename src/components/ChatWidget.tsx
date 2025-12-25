"use client";

import { IconButton, Flex, Column, Input, Text, Button } from "@once-ui-system/core";
import { useState } from "react";
import { AiIcon } from "./icons/AiIcon";
import styles from "./ChatWidget.module.scss";

export const ChatWidget = ({ variant = 'bubble' }: { variant?: 'bubble' | 'inline' }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: 'user' | 'assistant', text: string }[]>([
        { role: 'assistant', text: "Hello! I am your AI assistant. How can I help you learn today?" }
    ]);

    const handleSend = () => {
        if (!input.trim()) return;

        setMessages(prev => [...prev, { role: 'user', text: input }]);
        setInput("");

        // Simulate response
        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'assistant', text: "I'm just a demo widget for now, but I'm listening!I'm just a demo widget for now, but I'm listening!I'm just a demo widget for now, but I'm listening!I'm just a demo widget for now, but I'm listening!I'm just a demo widget for now, but I'm listening!" }]);
        }, 1000);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSend();
        }
    };

    return (
        <>
            {isOpen && (
                <Column
                    position="fixed"
                    bottom="104"
                    right="32"
                    s={{ bottom: "112", right: "16" }}
                    m={{ bottom: "112", right: "16" }}
                    style={{
                        zIndex: 50,
                        width: '440px',
                        maxWidth: 'calc(100vw - 32px)',
                        maxHeight: 'calc(100vh - 130px)',
                        height: '600px'
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
                    >
                        <Text variant="heading-strong-s">Chat AI</Text>
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
                                    alignSelf: msg.role === 'assistant' ? "flex-start" : "flex-end",
                                    maxWidth: "80%"
                                }}
                            >
                                <Flex
                                    padding="12"
                                    gap="12"
                                    radius="m"
                                    background={msg.role === 'assistant' ? "neutral-alpha-weak" : "brand-medium"}
                                >
                                    {msg.role === 'assistant' && (
                                        <Flex style={{ minWidth: "24px" }}>
                                            <AiIcon size={24} />
                                        </Flex>
                                    )}
                                    <Text
                                        variant="body-default-s"
                                        onBackground={msg.role === 'assistant' ? "neutral-strong" : "neutral-weak"}
                                        style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}
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
            )}

            <Flex
                position={variant === 'bubble' ? "fixed" : "static"}
                bottom={variant === 'bubble' ? "32" : undefined}
                right={variant === 'bubble' ? "32" : undefined}
                s={variant === 'bubble' ? { bottom: "136", right: "24" } : undefined}
                m={variant === 'bubble' ? { bottom: "136", right: "24" } : undefined}
                style={{ zIndex: 50 }}
            >
                {isOpen ? (
                    <IconButton
                        icon="close"
                        size="m"
                        variant="primary"
                        tooltip="Close Chat"
                        onClick={() => setIsOpen(false)}
                        style={{ borderRadius: '50%', width: '48px', height: '48px' }}
                    />
                ) : (
                    <Flex
                        className={variant === 'bubble' ? styles.trigger : undefined}
                        onClick={() => setIsOpen(true)}
                        vertical="center"
                        horizontal="center"
                        background="surface"
                        border="neutral-medium"
                        shadow={variant === 'bubble' ? "l" : undefined}
                        radius="l"
                        padding="4"
                        style={{
                            cursor: 'pointer',
                            borderRadius: '50%',
                            width: variant === 'inline' ? '40px' : '48px',
                            height: variant === 'inline' ? '40px' : '48px'
                        }}
                    >
                        <AiIcon size={variant === 'inline' ? 20 : 24} />
                    </Flex>
                )}
            </Flex>
        </>
    );
};
