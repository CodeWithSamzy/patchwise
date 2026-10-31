import { NextResponse } from "next/server";
import { z } from "zod";

import { analyzeSource } from "@/lib/analyzer";
import { checkRateLimit } from "@/lib/rate-limit";
import { saveScan } from "@/lib/scan-store";

export const runtime = "nodejs";

const requestSchema = z.object({
  source: z
    .string()
    .min(1, "Paste some code before starting a scan.")
    .max(50_000, "Code must be 50 KB or smaller."),
  language: z.enum(["javascript", "typescript"]).default("javascript"),
});

export async function POST(request: Request) {
  const clientAddress =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "local";
  const rateLimit = checkRateLimit(clientAddress);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many scans. Try again in a minute." },
      {
        status: 429,
        headers: {
          "Retry-After": String(
            Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          ),
        },
      },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "The request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid scan request." },
      { status: 400 },
    );
  }

  const result = analyzeSource(parsed.data.source, parsed.data.language);
  saveScan(result);

  return NextResponse.json(result, {
    status: 201,
    headers: {
      "Cache-Control": "no-store",
      "X-RateLimit-Remaining": String(rateLimit.remaining),
    },
  });
}
