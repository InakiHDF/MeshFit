import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizePrenda, stringifyArray } from "@/lib/utils";
import { prendaSchema } from "@/lib/validators";
import { ZodError } from "zod";

export async function GET() {
  const prendas = await prisma.prenda.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(prendas.map(normalizePrenda));
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = prendaSchema.parse(json);

    const prenda = await prisma.prenda.create({
      data: {
        ...data,
        secondaryColors: stringifyArray(data.secondaryColors),
        styleTags: stringifyArray(data.styleTags),
        seasonTags: stringifyArray(data.seasonTags),
        fit: data.fit,
      },
    });

    return NextResponse.json(normalizePrenda(prenda), { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "No se pudo crear la prenda" }, { status: 500 });
  }
}
