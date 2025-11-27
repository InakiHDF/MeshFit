import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizePrenda, stringifyArray } from "@/lib/utils";
import { prendaSchema } from "@/lib/validators";
import { ZodError } from "zod";

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params;
    const json = await request.json();
    const data = prendaSchema.partial().parse(json);

    const prenda = await prisma.prenda.update({
      where: { id },
      data: {
        ...data,
        secondaryColors:
          data.secondaryColors !== undefined
            ? stringifyArray(data.secondaryColors)
            : undefined,
        styleTags:
          data.styleTags !== undefined ? stringifyArray(data.styleTags) : undefined,
        seasonTags:
          data.seasonTags !== undefined ? stringifyArray(data.seasonTags) : undefined,
      },
    });

    return NextResponse.json(normalizePrenda(prenda));
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "No se pudo actualizar la prenda" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Params }) {
  try {
    const { id } = await params;
    await prisma.link.deleteMany({
      where: { OR: [{ prendaAId: id }, { prendaBId: id }] },
    });
    await prisma.prenda.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No se pudo eliminar la prenda" }, { status: 500 });
  }
}
