import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeLink, stringifyArray } from "@/lib/utils";
import { linkSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function GET() {
  const links = await prisma.link.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(links.map(normalizeLink));
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = linkSchema.parse(json);
    const [first, second] = [parsed.prendaAId, parsed.prendaBId].sort();

    const existing = await prisma.link.findFirst({
      where: { prendaAId: first, prendaBId: second },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un link entre esas prendas" },
        { status: 400 },
      );
    }

    const link = await prisma.link.create({
      data: {
        prendaAId: first,
        prendaBId: second,
        strength: parsed.strength,
        contextTags: stringifyArray(parsed.contextTags),
        notes: parsed.notes,
      },
    });

    return NextResponse.json(normalizeLink(link), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "No se pudo crear el link" }, { status: 500 });
  }
}
