import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  const { email, password, studioName, slug, phone, address, token } = await request.json();

  if (!email || !password || !studioName || !slug || !token) {
    return NextResponse.json({ error: "Faltan campos obligatorios" }, { status: 400 });
  }

  // Validar token de un solo uso
  const invite = await prisma.inviteToken.findUnique({ where: { token } });
  if (!invite || invite.usedAt) {
    return NextResponse.json({ error: "Enlace de acceso inválido o ya utilizado." }, { status: 403 });
  }

  const slugClean = slug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  const existing = await prisma.studio.findUnique({ where: { slug: slugClean } });
  if (existing) {
    return NextResponse.json({ error: "Esa URL ya está en uso, elige otra." }, { status: 409 });
  }

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (authError) {
    const msg = authError.message.toLowerCase();
    if (msg.includes("already registered") || msg.includes("already been registered")) {
      return NextResponse.json({ error: "Ese email ya está registrado." }, { status: 409 });
    }
    return NextResponse.json({ error: "Error al crear la cuenta." }, { status: 500 });
  }

  // Marcar token como usado y crear estudio en una sola transacción
  await prisma.$transaction([
    prisma.inviteToken.update({ where: { token }, data: { usedAt: new Date() } }),
    prisma.studio.create({
      data: {
        name: studioName,
        slug: slugClean,
        email,
        phone: phone || null,
        address: address || null,
        depositDefaultAmount: 5000,
        artists: { create: { name: "Artista Principal", isActive: true } },
        users: {
          create: {
            id: authData.user!.id,
            name: studioName,
            email,
            role: "ADMIN",
          },
        },
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
