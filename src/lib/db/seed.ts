import { db } from "./index";
import { shapes } from "./schema";
import { SEED_SHAPES } from "@/lib/persona/examples";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding shapes...");
  for (const { slug, persona } of SEED_SHAPES) {
    const existing = await db.query.shapes.findFirst({
      where: eq(shapes.slug, slug),
    });
    if (existing) {
      console.log(`Shape ${slug} already exists, skipping.`);
      continue;
    }
    await db.insert(shapes).values({
      slug,
      display_name: persona.identity.display_name,
      persona_kernel: persona,
      is_public: true,
    });
    console.log(`Created shape: ${slug}`);
  }
  console.log("Seed complete.");
  process.exit(0);
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
