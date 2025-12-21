"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Flex, Spinner } from "@once-ui-system/core";

export function ClientRedirect({ url }: { url: string }) {
    const router = useRouter();

    useEffect(() => {
        router.replace(url);
    }, [url, router]);

    return (
        <Flex fillWidth height="80" horizontal="center" vertical="center">
            <Spinner />
        </Flex>
    );
}
