import { NextResponse } from "next/server";

import { getScan } from "@/lib/scan-store";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const result = getScan(id);

  if (!result) {
    return NextResponse.json(
      { error: "Scan not found or it has expired." },
      { status: 404 },
    );
  }

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
