"use client";

import type { AnchorHTMLAttributes, MouseEvent } from "react";

import {
  trackEvent,
  type AnalyticsEventName,
  type AnalyticsProperties,
} from "@/lib/analytics";

type TrackedLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  analyticsEvent: AnalyticsEventName;
  analyticsProperties?: AnalyticsProperties;
};

export function TrackedLink({
  analyticsEvent,
  analyticsProperties,
  onClick,
  ...props
}: TrackedLinkProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    trackEvent(analyticsEvent, analyticsProperties);
    onClick?.(event);
  }

  return <a {...props} onClick={handleClick} />;
}
