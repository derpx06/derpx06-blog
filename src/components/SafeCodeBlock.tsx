"use client";

import React, { Component, ReactNode } from "react";
import { CodeBlock, Row, Icon, Text } from "@once-ui-system/core";

interface Props {
    children?: ReactNode;
    minimized?: boolean;
    [key: string]: any;
}

interface State {
    hasError: boolean;
    isExpanded: boolean;
}

function toCodeString(value: unknown): string {
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    if (value && typeof value === "object" && "content" in (value as Record<string, unknown>)) {
        const content = (value as { content?: unknown }).content;
        return typeof content === "string" ? content : "";
    }
    return "";
}

function normalizeCodes(codes: any): Array<{ code: string; language: string; label: string }> {
    if (!Array.isArray(codes) || codes.length === 0) {
        return [{ code: "", language: "text", label: "Code" }];
    }

    return codes.map((item: any) => {
        const language = typeof item?.language === "string" && item.language.length > 0 ? item.language : "text";
        const label = typeof item?.label === "string" && item.label.length > 0 ? item.label : "Code";
        return {
            code: toCodeString(item?.code),
            language,
            label,
        };
    });
}

if (typeof navigator !== "undefined" && !navigator.clipboard) {
    (navigator as any).clipboard = {
        writeText: async (text: string) => {
            try {
                const textArea = document.createElement("textarea");
                textArea.value = text;

                textArea.style.position = "fixed";
                textArea.style.left = "-9999px";
                textArea.style.top = "0";

                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (!successful) {
                    console.error('Fallback: Copying text command was unsuccessful');
                }
            } catch (err) {
                console.error('Fallback: Oops, unable to copy', err);
            }
        }
    };
}

export class SafeCodeBlock extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            isExpanded: !props.minimized
        };
    }

    static getDerivedStateFromError(_: Error): State {
        return { hasError: true, isExpanded: false };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("CodeBlock crashed:", error, errorInfo);
    }

    toggleExpand = () => {
        this.setState(prevState => ({ isExpanded: !prevState.isExpanded }));
    };

    render() {
        if (this.state.hasError) {
            return (
                <pre
                    style={{
                        padding: "1rem",
                        background: "#ffebee",
                        color: "#c62828",
                        borderRadius: "4px",
                        overflow: "auto"
                    }}
                >
                    <code>Error rendering code block. Check console for details.</code>
                </pre>
            );
        }

        const { minimized, codes, ...restProps } = this.props;
        const { isExpanded } = this.state;
        const safeCodes = normalizeCodes(codes);
        const label = safeCodes[0]?.label || "Code";

        // Standard block (not collapsible)
        if (!minimized) {
            return (
                <div style={{ marginBottom: "var(--spacing-16)" }}>
                    <CodeBlock {...restProps} codes={safeCodes} />
                </div>
            );
        }

        // Collapsible block
        return (
            <div style={{ marginBottom: "var(--spacing-16)" }}>
                <div
                    onClick={this.toggleExpand}
                    style={{
                        cursor: "pointer",
                        userSelect: "none",
                        padding: "12px 16px",
                        borderRadius: "var(--radius-l)",
                        border: "1px solid var(--neutral-border-medium)",
                        background: "var(--background-surface)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: isExpanded ? "8px" : "0",
                        transition: "margin-bottom 0.3s ease"
                    }}
                >
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <Text variant="label-default-s">{label}</Text>
                        {!isExpanded && (
                            <Text variant="body-default-xs" onBackground="neutral-weak">
                                (Click to expand)
                            </Text>
                        )}
                    </div>

                    <div
                        style={{
                            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
                            transition: "transform 0.3s ease",
                            display: "flex",
                            alignItems: "center"
                        }}
                    >
                        <Icon name="chevronRight" size="s" />
                    </div>
                </div>

                {isExpanded && (
                    <div style={{ animation: "fadeIn 0.25s ease-out" }}>
                        <CodeBlock {...restProps} codes={safeCodes} />
                    </div>
                )}
            </div>
        );
    }
}
