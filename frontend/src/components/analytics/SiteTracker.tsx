"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { startSessionTracking } from "@/utils/tracking";

export default function SiteTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Keep the admin panel out of the visitor analytics.
    if (pathname.startsWith("/admin")) return;

    const stop = startSessionTracking();
    return stop;
  }, [pathname]);

  return null;
}
