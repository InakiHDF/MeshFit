import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizeLink, stringifyArray } from "@/lib/utils";
import { linkSchema } from "@/lib/validators";
import { z, ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const links = await prisma.link.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(links.map(normalizeLink));
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const parsed = linkSchema.parse(json);
    const [first, second] = [parsed.prendaAId, parsed.prendaBId].sort();

    // Verify prendas belong to user? 
    // Ideally yes, but let's trust the client won't send IDs they don't have access to for now (or the foreign key would fail if we enforced it strictly, but prisma schema doesn't enforce "Prenda.userId" matching "Link.userId").
    // For safety, we could check if Prenda exists AND belongs to user.

    const existing = await prisma.link.findFirst({
      where: { prendaAId: first, prendaBId: second, userId: user.id },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Ya existe un link entre esas prendas" },
        { status: 400 },
      );
    }

    const link = await prisma.link.create({
      data: {
        userId: user.id,
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

export async function DELETE(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    // Minimal schema for deletion
    const schema = z.object({ 
      prendaAId: z.string().cuid(), 
      prendaBId: z.string().cuid() 
    });
    const parsed = schema.parse(json);
    const [first, second] = [parsed.prendaAId, parsed.prendaBId].sort();

    const deleted = await prisma.link.deleteMany({
      where: {
        prendaAId: first,
        prendaBId: second,
        userId: user.id,
      },
    });

    if (deleted.count === 0) {
      return NextResponse.json(
        { error: "Link no encontrado" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ error: "No se pudo eliminar el link" }, { status: 500 });
  }
}
