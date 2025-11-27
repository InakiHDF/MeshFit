import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateLocalOutfits } from "@/lib/outfitRules";
import { normalizeLink, normalizePrenda } from "@/lib/utils";
import { generateOutfitsSchema } from "@/lib/validators";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const data = generateOutfitsSchema.parse(json);

    const prendas = await prisma.prenda.findMany({ where: { userId: user.id } });
    const links = await prisma.link.findMany({ where: { userId: user.id } });

    const outfits = generateLocalOutfits({
      prendas: prendas.map(normalizePrenda),
      links: links.map(normalizeLink),
      occasion: data.occasion,
      formalidadObjetivo: data.formalidadObjetivo,
      requiredPrendaIds: data.requiredPrendaIds,
    });

    return NextResponse.json(outfits);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json(
      { error: "No se pudieron generar outfits en este momento" },
      { status: 500 },
    );
  }
}
