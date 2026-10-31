import { NextResponse } from "next/server";

import { getLesson } from "@/lib/lessons";

export async function GET(
  _request: Request,
  context: { params: Promise<{ slug: string }> },
) {
  const { slug } = await context.params;
  const lesson = getLesson(slug);

  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  return NextResponse.json(lesson);
}
