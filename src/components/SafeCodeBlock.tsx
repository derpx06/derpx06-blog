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
    }

    render() {
        if (this.state.hasError) {
            return (
                <pre style={{ padding: '1rem', background: '#f5f5f5', color: '#000', borderRadius: '4px', overflow: 'auto' }}>
                    <code>{JSON.stringify(this.props.codes || this.props.children, null, 2)}</code>
                </pre>
            );
        }

        const { minimized, ...restProps } = this.props;
        const { isExpanded } = this.state;
        const label = restProps.codes?.[0]?.label || "Code";

        // Standard block (not collapsible)
        if (!minimized) {
            return (
                <div style={{ marginBottom: 'var(--spacing-16)' }}>
                    <CodeBlock {...restProps} />
                </div>
            );
        }

        // Collapsible block with Animation
        return (
            <div style={{ marginBottom: 'var(--spacing-16)' }}>
                <div
                    onClick={this.toggleExpand}
                    style={{
                        cursor: 'pointer',
                        userSelect: 'none',
                        padding: '12px 16px',
                        borderRadius: 'var(--radius-l)',
                        border: '1px solid var(--neutral-border-medium)',
                        background: 'var(--background-surface)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: isExpanded ? '8px' : '0',
                        transition: 'margin-bottom 0.3s ease' // Smooth margin transition
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Text variant="label-default-s">{label}</Text>
                        {!isExpanded && (
                            <Text variant="body-default-xs" onBackground="neutral-weak">
                                (Click to expand)
                            </Text>
                        )}
                    </div>
                    {/* Rotate the arrow icon instead of swapping it */}
                    <div style={{
                        transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                        transition: 'transform 0.3s ease',
                        display: 'flex',
                        alignItems: 'center'
                    }}>
                        <Icon name="chevronRight" size="s" />
                    </div>
                </div>

                {/* Grid Animation Wrapper */}
                <div style={{
                    display: 'grid',
                    // If expanded 1fr, else 0fr. This animates height from 0 to auto.
                    gridTemplateRows: isExpanded ? '1fr' : '0fr',
                    transition: 'grid-template-rows 0.3s ease-out, opacity 0.3s ease',
                    opacity: isExpanded ? 1 : 0
                }}>
                    <div style={{ overflow: 'hidden' }}>
                        <CodeBlock {...restProps} />
                    </div>
                </div>
            </div>
        );
    }
}
