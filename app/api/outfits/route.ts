import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeLink, normalizeOutfit, stringifyArray } from "@/lib/utils";
import { saveOutfitSchema } from "@/lib/validators";
import { isClique } from "@/lib/outfitRules";
import { ZodError } from "zod";

function buildGraph(links: ReturnType<typeof normalizeLink>[]) {
  const graph = new Map<string, Set<string>>();
  links.forEach((link) => {
    const a = graph.get(link.prendaAId) ?? new Set<string>();
    a.add(link.prendaBId);
    graph.set(link.prendaAId, a);

    const b = graph.get(link.prendaBId) ?? new Set<string>();
    b.add(link.prendaAId);
    graph.set(link.prendaBId, b);
  });
  return graph;
}

export async function GET() {
  const outfits = await prisma.outfit.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(outfits.map(normalizeOutfit));
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = saveOutfitSchema.parse(json);
    const prendas = await prisma.prenda.findMany({
      where: { id: { in: data.prendasIds } },
    });
    if (prendas.length !== data.prendasIds.length) {
      return NextResponse.json(
        { error: "Alguna prenda no existe en la base." },
        { status: 400 },
      );
    }

    const links = (await prisma.link.findMany()).map(normalizeLink);
    const graph = buildGraph(links);

    if (!isClique(data.prendasIds, graph)) {
      return NextResponse.json(
        { error: "El outfit no cumple la regla de clique completa." },
        { status: 400 },
      );
    }

    const outfit = await prisma.outfit.create({
      data: {
        prendasIds: stringifyArray(data.prendasIds),
        occasion: data.occasion,
        description: data.description,
        aiModel: data.aiModel ?? null,
      },
    });

    return NextResponse.json(normalizeOutfit(outfit), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "No se pudo guardar el outfit" }, { status: 500 });
  }
}
