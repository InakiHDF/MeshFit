import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateLocalOutfits } from "@/lib/outfitRules";
import { normalizeLink, normalizePrenda } from "@/lib/utils";
import { generateOutfitsSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = generateOutfitsSchema.parse(json);

    const prendas = await prisma.prenda.findMany();
    const links = await prisma.link.findMany();

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
