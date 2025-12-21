"use client";

import React, { Component, ReactNode } from "react";
import { CodeBlock } from "@once-ui-system/core";

interface Props {
    children?: ReactNode;
    [key: string]: any;
}

interface State {
    hasError: boolean;
}

export class SafeCodeBlock extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(_: Error): State {
        return { hasError: true };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("CodeBlock crashed:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <pre style={{ padding: '1rem', background: '#f5f5f5', color: '#000', borderRadius: '4px', overflow: 'auto' }}>
                    <code>{JSON.stringify(this.props.codes || this.props.children, null, 2)}</code>
                </pre>
            );
        }

        return <CodeBlock {...this.props} />;
    }
}
