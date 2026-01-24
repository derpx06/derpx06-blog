"use client";

import React, { useState } from "react";
import { CodeBlock, Row, Text, Column } from "@once-ui-system/core";

interface JupyterCell {
    code: string;
    output?: string;
    label: string;
    language: string;
    showOutput?: boolean;  // Control output visibility per cell
}

interface JupyterCodeBlockProps {
    cells: JupyterCell[];
    marginBottom?: string;
}

export function JupyterCodeBlock({ cells, marginBottom = "24" }: JupyterCodeBlockProps) {
    const [activeTab, setActiveTab] = useState(0);

    if (!cells || cells.length === 0) {
        return null;
    }

    const activeCell = cells[activeTab];

    return (
        <div style={{ marginBottom: `var(--spacing-${marginBottom})` }}>
            {/* Tabs for different providers */}
            {cells.length > 1 && (
                <Row
                    gap="8"
                    marginBottom="12"
                    fillWidth
                    style={{
                        borderBottom: "1px solid var(--neutral-border-medium)",
                        paddingBottom: "8px",
                        overflowX: "auto",
                        flexWrap: "nowrap",
                        scrollbarWidth: "none", // Hide scrollbar for cleaner look
                        msOverflowStyle: "none"
                    }}
                >
                    {cells.map((cell, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveTab(index)}
                            style={{
                                background: activeTab === index ? "var(--accent-background-medium)" : "transparent",
                                color: activeTab === index ? "var(--accent-on-background-medium)" : "var(--neutral-on-background-weak)",
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "var(--radius-m)",
                                cursor: "pointer",
                                fontSize: "var(--label-default-s-size)",
                                fontWeight: activeTab === index ? 600 : 400,
                                transition: "all 0.2s ease",
                                whiteSpace: "nowrap",
                                flexShrink: 0
                            }}
                        >
                            {cell.label}
                        </button>
                    ))}
                </Row>
            )}

            {/* Code Section */}
            <div style={{ marginBottom: (activeCell.showOutput && activeCell.output) ? "16px" : "0" }}>
                <CodeBlock
                    codes={[
                        {
                            code: activeCell.code,
                            language: activeCell.language,
                            label: activeCell.label
                        }
                    ]}
                />
            </div>

            {/* Output Section - only show if showOutput is explicitly true */}
            {activeCell.showOutput && activeCell.output && (
                <Column
                    padding="16"
                    radius="m"
                    border="neutral-alpha-medium"
                    style={{
                        background: "var(--neutral-alpha-weak)",
                        backdropFilter: "blur(12px)",
                        WebkitBackdropFilter: "blur(12px)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "var(--label-default-s-size)"
                    }}
                >
                    <Text
                        variant="label-default-xs"
                        onBackground="neutral-weak"
                        marginBottom="8"
                        style={{ textTransform: "uppercase", letterSpacing: "0.05em" }}
                    >
                        Output
                    </Text>
                    <div
                        style={{
                            maxHeight: "24rem", // Approx 15 lines
                            overflowY: "auto",
                        }}
                    >
                        <pre
                            style={{
                                margin: 0,
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-word",
                                color: "var(--neutral-on-background-medium)",
                                lineHeight: "1.6"
                            }}
                        >
                            {activeCell.output}
                        </pre>
                    </div>
                </Column>
            )}
        </div>
    );
}
