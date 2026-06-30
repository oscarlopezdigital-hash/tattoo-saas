import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.SUPERADMIN_EMAIL) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const invite = await prisma.inviteToken.create({ data: {} });
  const appUrl = process.env.NEXT_PUBLIC_APP_URL!;

  return NextResponse.json({ url: `${appUrl}/registro?token=${invite.token}` });
}
