"use client";

import { Column } from "@once-ui-system/core";

export function CourseContent({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Column fillWidth gap="32" className="course-content">
                {children}
            </Column>
            <style jsx global>{`
                .course-content {
                    padding-left: 0 !important;
                    padding-right: 16px !important;
                    transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }

                @media (min-width: 1025px) {
                    .course-content {
                        padding-left: 280px !important;
                        padding-right: 32px !important;
                    }
                }

                @media (max-width: 768px) {
                    .course-content {
                        padding-left: 16px !important;
                        padding-right: 16px !important;
                    }
                }
                @media (min-width: 769px) and (max-width: 1024px) and (max-height: 850px) {
                    .course-content {
                        margin-top: -4rem !important;
                    }
                }
                @media (max-height: 500px) and (orientation: landscape) {
                    .course-content {
                        margin-top: -32px !important;
                    }
                }
            `}</style>
        </>
    );
}
