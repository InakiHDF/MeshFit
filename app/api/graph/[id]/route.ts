import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

type Params = Promise<{ id: string }>;

export async function DELETE(_request: Request, { params }: { params: Params }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const count = await prisma.link.count({ where: { id, userId: user.id } });
    if (count === 0) return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });

    await prisma.link.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "No se pudo eliminar el link" }, { status: 500 });
  }
}
