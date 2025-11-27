import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizePrenda, stringifyArray } from "@/lib/utils";
import { prendaSchema } from "@/lib/validators";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;

export async function PATCH(request: Request, { params }: { params: Params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const json = await request.json();
    const data = prendaSchema.partial().parse(json);

    // Verify ownership first or use updateMany (though updateMany doesn't return the record easily in all cases, update with where AND is better but Prisma update needs unique ID alone)
    // Actually, update allows `where: { id_userId: ... }` if there is a unique constraint, but we don't have that composite unique yet.
    // So we should check existence or just rely on `findFirst` then `update`.
    // A cleaner way in Prisma is `updateMany` which returns count.
    
    const count = await prisma.prenda.count({ where: { id, userId: user.id } });
    if (count === 0) return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });

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
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;

    const count = await prisma.prenda.count({ where: { id, userId: user.id } });
    if (count === 0) return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });

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
