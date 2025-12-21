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
                }
                @media (min-width: 1025px) {
                    .course-content {
                        padding-left: 256px !important;
                    }
                }
            `}</style>
        </>
    );
}
