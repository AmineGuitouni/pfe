"use client";

import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import useLocalStorage from "@/hooks/useLocalStorage";

interface SkipCvToken {
    expiry: number;
}

export default function CvGateKeeper() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [skipToken, setSkipToken] = useLocalStorage<SkipCvToken | null>("skip_cv_reminder", null);

    useEffect(() => {
        if (status === "loading") return;

        if (session?.user?.role === "worker" && !session?.user?.cv_informations) {
            // Check if on provide_cv page
            const isProvideCvPage = pathname === "/provide_cv" || pathname.endsWith("/provide_cv");
            
            // If already on the page, don't continuously redirect to it
            if (isProvideCvPage) return;

            // Check if user has a valid skip token
            if (skipToken && skipToken.expiry > Date.now()) {
                return;
            }

            // Redirect to provide_cv
            router.push("/provide_cv");
        }
    }, [session, status, pathname, skipToken, router]);

    return null;
}
