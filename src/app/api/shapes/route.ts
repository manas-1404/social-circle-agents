import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { shapes } from "@/lib/db/schema";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userShapes = await db
    .select()
    .from(shapes)
    .where(eq(shapes.creator_id, session.user.id));
  return NextResponse.json(userShapes);
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { display_name, persona_kernel } = body;
  if (!display_name || !persona_kernel) {
    return NextResponse.json({ error: "display_name and persona_kernel required" }, { status: 400 });
  }

  const base = display_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const randomSuffix = Math.random().toString(36).slice(2, 6);
  const finalSlug = `${base}-${randomSuffix}`;

  const [shape] = await db
    .insert(shapes)
    .values({
      slug: finalSlug,
      display_name,
      persona_kernel,
      creator_id: session.user.id,
      is_public: false,
    })
    .returning();

  return NextResponse.json(shape, { status: 201 });
}
