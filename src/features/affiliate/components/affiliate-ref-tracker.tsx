"use client";

import * as React from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useTrackAffiliateClickMutation } from "../api/affiliate-api";

function AffiliateRefTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [trackClick] = useTrackAffiliateClickMutation();
  const lastTrackedRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const ref = searchParams?.get("ref")?.trim();
    if (!ref) return;

    const dedupeKey = `${ref}:${pathname}`;
    if (lastTrackedRef.current === dedupeKey) return;
    lastTrackedRef.current = dedupeKey;

    const landingUrl = `${pathname || "/"}${searchParams?.toString() ? `?${searchParams.toString()}` : ""}`;
    const referrer = typeof document !== "undefined" ? document.referrer || null : null;

    void trackClick({ code: ref, landingUrl, referrer });
  }, [pathname, searchParams, trackClick]);

  return null;
}

export function AffiliateRefTracker() {
  return (
    <React.Suspense fallback={null}>
      <AffiliateRefTrackerInner />
    </React.Suspense>
  );
}
