import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shapes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;
  const shape = await db.query.shapes.findFirst({
    where: eq(shapes.slug, slug),
  });
  if (!shape) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(shape);
}
