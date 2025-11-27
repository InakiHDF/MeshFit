import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { normalizePrenda, stringifyArray } from "@/lib/utils";
import { prendaSchema } from "@/lib/validators";
import { ZodError } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const prendas = await prisma.prenda.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(prendas.map(normalizePrenda));
}

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const json = await request.json();
    const data = prendaSchema.parse(json);

    const prenda = await prisma.prenda.create({
      data: {
        ...data,
        userId: user.id,
        secondaryColors: stringifyArray(data.secondaryColors),
        styleTags: stringifyArray(data.styleTags),
        seasonTags: stringifyArray(data.seasonTags),
        fit: data.fit,
      },
    });

    return NextResponse.json(normalizePrenda(prenda), { status: 201 });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }
    console.error("Error creando prenda:", error);
    // Return actual error message for debugging
    return NextResponse.json(
      { error: error.message || "Error desconocido en el servidor", details: error }, 
      { status: 500 }
    );
  }
}
