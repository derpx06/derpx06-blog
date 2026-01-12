"use client";

import React, { useRef, useState, useEffect } from 'react';
import { Tooltip } from './Tooltip';
import { Text } from '@once-ui-system/core';

interface SmartTruncateProps {
    children: string;
    className?: string;
    as?: any;
    [key: string]: any; // Allow passing through other props to the component
}

export const SmartTruncate: React.FC<SmartTruncateProps> = ({
    children,
    as: Component = Text,
    className,
    ...props
}) => {
    const textRef = useRef<HTMLElement>(null);
    const [isTruncated, setIsTruncated] = useState(false);

    const checkTruncation = () => {
        const element = textRef.current;
        if (element) {
            const isOverflowing = element.scrollWidth > element.clientWidth ||
                element.scrollHeight > element.clientHeight;
            setIsTruncated(isOverflowing);
        }
    };

    useEffect(() => {
        const element = textRef.current;
        if (!element) return;

        const observer = new ResizeObserver(() => {
            checkTruncation();
        });

        observer.observe(element);

        if (element.parentElement) {
            observer.observe(element.parentElement);
        }

        checkTruncation();

        return () => observer.disconnect();
    }, [children]);

    const content = (
        <Component
            ref={textRef}
            className={className}
            {...props}
            style={{
                ...props.style,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: 'block',
                width: '100%'
            }}
        >
            {children}
        </Component>
    );

    if (isTruncated) {
        return (
            <Tooltip
                content={children}
                className={className}
                style={{ width: '100%', display: 'block' }}
            >
                {content}
            </Tooltip>
        );
    }

    return content;
};
