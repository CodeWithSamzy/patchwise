import { NextResponse } from "next/server";

import { lessons } from "@/lib/lessons";

export async function GET() {
  return NextResponse.json(
    lessons.map(({ vulnerable, fixed, takeaways, ...lesson }) => lesson),
  );
}
