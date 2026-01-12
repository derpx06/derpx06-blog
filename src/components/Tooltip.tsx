"use client";

import React, { useState, useRef, useEffect } from 'react';
import classNames from 'classnames';
import styles from './Tooltip.module.scss';
import { Flex } from '@once-ui-system/core';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    side?: 'top' | 'bottom';
    className?: string;
    style?: React.CSSProperties;
}

import { createPortal } from 'react-dom';

export const Tooltip: React.FC<TooltipProps> = ({
    content,
    children,
    side = 'top',
    className
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<{ top: number; left: number; placement: 'top' | 'bottom' } | null>(null);

    const updatePosition = () => {
        if (!containerRef.current || !tooltipRef.current) return;

        const containerRect = containerRef.current.getBoundingClientRect();
        const tooltipRect = tooltipRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Default to top
        let top = containerRect.top - tooltipRect.height - 8;
        let left = containerRect.left + (containerRect.width - tooltipRect.width) / 2;
        let placement: 'top' | 'bottom' = 'top';

        // Flip to bottom if not enough space on top
        if (top < 16) {
            top = containerRect.bottom + 8;
            placement = 'bottom';
        }

        // Shift horizontally if going off-screen
        if (left < 16) {
            left = 16;
        } else if (left + tooltipRect.width > viewportWidth - 16) {
            left = viewportWidth - 16 - tooltipRect.width;
        }

        setPosition({ top, left, placement });
    };

    useEffect(() => {
        if (isVisible) {
            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition);
        }
        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition);
        }
    }, [isVisible]);

    return (
        <div
            ref={containerRef}
            className={classNames(styles.container, className)}
            onMouseEnter={() => { setIsVisible(true); setTimeout(updatePosition, 0); }}
            onMouseLeave={() => setIsVisible(false)}
            onFocus={() => setIsVisible(true)}
            onBlur={() => setIsVisible(false)}
        >
            {children}
            {isVisible && createPortal(
                <div
                    ref={tooltipRef}
                    className={classNames(styles.tooltip, { [styles.visible]: isVisible })}
                    style={{
                        position: 'fixed',
                        top: position?.top ?? -9999,
                        left: position?.left ?? -9999,
                        opacity: position ? 1 : 0,
                        visibility: position ? 'visible' : 'hidden',
                        zIndex: 9999
                    }}
                >
                    {content}
                    <div
                        className={styles.arrow}
                        style={{
                            bottom: position?.placement === 'top' ? '-4px' : 'auto',
                            top: position?.placement === 'bottom' ? '-4px' : 'auto',
                            left: '50%',
                            transform: 'translateX(-50%) rotate(45deg)'
                        }}
                    />
                </div>,
                document.body
            )}
        </div>
    );
};
