"use client";

import posthog from "posthog-js";

export type AnalyticsEventName =
  | "lesson_started"
  | "repository_opened"
  | "sample_loaded"
  | "scan_completed"
  | "scanner_cta_clicked"
  | "verified_fix_applied"
  | "verified_fix_copied"
  | "verified_fix_viewed";

export type AnalyticsProperties = Record<
  string,
  boolean | number | string
>;

export function trackEvent(
  eventName: AnalyticsEventName,
  properties?: AnalyticsProperties,
): void {
  if (!process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN) return;
  posthog.capture(eventName, properties);
}
