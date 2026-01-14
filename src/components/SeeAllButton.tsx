"use client";

import { Button, Icon, Row, Text } from "@once-ui-system/core";

interface SeeAllButtonProps {
    href: string;
}

export const SeeAllButton = ({ href }: SeeAllButtonProps) => {
    return (
        <>
            <Button href={href} variant="secondary" className="see-all-button">
                See all
                <Icon name="chevronRight" size="s" className="see-all-arrow" />
            </Button>
            <style jsx global>{`
                .see-all-button .see-all-arrow {
                    opacity: 0;
                    width: 0;
                    margin-left: 0;
                    transition: all 0.3s ease;
                    transform: translateX(-10px);
                }
                .see-all-button:hover .see-all-arrow {
                    opacity: 1;
                    width: 16px; /* Adjust based on icon size s */
                    margin-left: 8px;
                    transform: translateX(0);
                }
            `}</style>
        </>
    );
};
