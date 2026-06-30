import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEMO_EMAIL = "demo@tattoo-saas.com";
const DEMO_PASSWORD = "Demo1234!";

async function main() {
  console.log("🌱 Iniciando seed del Estudio Demo...\n");

  // ── 1. Limpiar datos anteriores del demo ─────────────────────────────────
  const studioExistente = await prisma.studio.findUnique({
    where: { slug: "ink-masters-valdemoro" },
  });
  if (studioExistente) {
    await prisma.studio.delete({ where: { slug: "ink-masters-valdemoro" } });
    console.log("♻️  Datos anteriores del demo eliminados");
  }

  // ── 2. Crear usuario en Supabase Auth ────────────────────────────────────
  const { data: authData, error: authError } =
    await supabaseAdmin.auth.admin.createUser({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      email_confirm: true,
    });

  if (authError && authError.message !== "User already registered") {
    throw new Error(`Error creando usuario auth: ${authError.message}`);
  }

  let userId = authData?.user?.id;
  if (!userId) {
    const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
    const found = existing?.users?.find((u) => u.email === DEMO_EMAIL);
    userId = found?.id;
  }
  if (!userId) throw new Error("No se pudo obtener el ID del usuario demo");
  console.log(`✅ Usuario Auth creado: ${DEMO_EMAIL}`);

  // ── 3. Crear estudio ─────────────────────────────────────────────────────
  const studio = await prisma.studio.create({
    data: {
      name: "Ink Masters Valdemoro",
      slug: "ink-masters-valdemoro",
      email: "inkmastersvaldemoro@gmail.com",
      phone: "916 123 456",
      address: "Calle Mayor 12, 28340 Valdemoro, Madrid",
      depositDefaultAmount: 5000,
      consentFormTemplate:
        "Yo, el/la abajo firmante, declaro haber sido informado/a de los riesgos y cuidados del tatuaje. Confirmo que no padezco ninguna de las contraindicaciones indicadas y autorizo la realización del procedimiento.\n\nMe comprometo a seguir las instrucciones de cuidado post-tatuaje proporcionadas por el artista.",
    },
  });
  console.log(`✅ Estudio creado: ${studio.name}`);

  // ── 4. Crear usuario del estudio (vinculado al auth) ─────────────────────
  await prisma.user.create({
    data: {
      id: userId,
      studioId: studio.id,
      name: "Carlos Méndez",
      email: DEMO_EMAIL,
      role: "ADMIN",
    },
  });
  console.log(`✅ Usuario vinculado al estudio`);

  // ── 5. Crear artista ─────────────────────────────────────────────────────
  const artist = await prisma.artist.create({
    data: {
      studioId: studio.id,
      name: "Carlos Méndez",
      color: "#6366f1",
      isActive: true,
    },
  });
  console.log(`✅ Artista creado: ${artist.name}`);

  // ── 6. Crear disponibilidad (lunes a sábado, 10h-20h) ────────────────────
  const diasLaborables = [1, 2, 3, 4, 5, 6]; // lun-sáb
  await prisma.availability.createMany({
    data: diasLaborables.map((day) => ({
      studioId: studio.id,
      dayOfWeek: day,
      startTime: "10:00",
      endTime: "20:00",
      isActive: true,
    })),
  });
  console.log(`✅ Disponibilidad configurada (Lun-Sáb 10:00-20:00)`);

  // ── 7. Crear clientes ─────────────────────────────────────────────────────
  const [maria, pedro, ana, javier] = await Promise.all([
    prisma.client.create({
      data: {
        studioId: studio.id,
        name: "María García",
        phone: "666111222",
        email: "maria.garcia@gmail.com",
        birthDate: new Date("1995-03-15"),
        notes: "Le gustan los diseños minimalistas. Alérgica al níquel.",
      },
    }),
    prisma.client.create({
      data: {
        studioId: studio.id,
        name: "Pedro Rodríguez",
        phone: "677333444",
        email: "pedro.rod@hotmail.com",
        birthDate: new Date("1990-07-22"),
        notes: "Primera vez que se tatúa. Nervioso con el dolor.",
      },
    }),
    prisma.client.create({
      data: {
        studioId: studio.id,
        name: "Ana Martínez",
        phone: "655444555",
        email: "ana.martinez@outlook.com",
        birthDate: new Date("1988-11-08"),
      },
    }),
    prisma.client.create({
      data: {
        studioId: studio.id,
        name: "Javier López",
        phone: "699555666",
        birthDate: new Date("1993-05-30"),
        notes: "Cliente habitual. Tiene 4 tatuajes anteriores.",
      },
    }),
  ]);
  console.log(`✅ 4 clientes creados`);

  // ── 8. Crear citas con distintos estados ──────────────────────────────────
  const ahora = new Date();
  const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

  const manana = new Date(hoy);
  manana.setDate(manana.getDate() + 1);
  manana.setHours(11, 0, 0, 0);

  const pasadoManana = new Date(hoy);
  pasadoManana.setDate(pasadoManana.getDate() + 2);
  pasadoManana.setHours(16, 0, 0, 0);

  const proxSemana = new Date(hoy);
  proxSemana.setDate(proxSemana.getDate() + 5);
  proxSemana.setHours(10, 0, 0, 0);

  const semanaPassada = new Date(hoy);
  semanaPassada.setDate(semanaPassada.getDate() - 7);
  semanaPassada.setHours(12, 0, 0, 0);

  const dosSemanasAtras = new Date(hoy);
  dosSemanasAtras.setDate(dosSemanasAtras.getDate() - 14);
  dosSemanasAtras.setHours(15, 0, 0, 0);

  // Cita 1: mañana, confirmada con depósito pagado
  const cita1 = await prisma.appointment.create({
    data: {
      studioId: studio.id,
      clientId: maria.id,
      artistId: artist.id,
      dateTime: manana,
      estimatedDuration: 180,
      status: "CONFIRMED",
      tattooDescription: "Rosa minimalista en muñeca derecha, tamaño pequeño",
      estimatedPrice: 12000,
      deposit: {
        create: {
          amount: 5000,
          stripeSessionId: "cs_test_demo_001",
          stripePaymentId: "pi_test_demo_001",
          status: "PAID",
        },
      },
    },
  });

  // Cita 2: pasado mañana, pendiente de depósito
  await prisma.appointment.create({
    data: {
      studioId: studio.id,
      clientId: pedro.id,
      artistId: artist.id,
      dateTime: pasadoManana,
      estimatedDuration: 120,
      status: "PENDING",
      tattooDescription: "Calavera estilo tradicional en antebrazo izquierdo",
      estimatedPrice: 18000,
      deposit: {
        create: {
          amount: 5000,
          status: "PENDING",
        },
      },
    },
  });

  // Cita 3: próxima semana, confirmada
  await prisma.appointment.create({
    data: {
      studioId: studio.id,
      clientId: javier.id,
      artistId: artist.id,
      dateTime: proxSemana,
      estimatedDuration: 240,
      status: "CONFIRMED",
      tattooDescription: "Manga completa brazo derecho, continuación",
      estimatedPrice: 45000,
      deposit: {
        create: {
          amount: 5000,
          stripeSessionId: "cs_test_demo_003",
          stripePaymentId: "pi_test_demo_003",
          status: "PAID",
        },
      },
    },
  });

  // Cita 4: semana pasada, completada con consentimiento firmado
  const cita4 = await prisma.appointment.create({
    data: {
      studioId: studio.id,
      clientId: ana.id,
      artistId: artist.id,
      dateTime: semanaPassada,
      estimatedDuration: 90,
      status: "COMPLETED",
      tattooDescription: "Mariposa geométrica en tobillo",
      estimatedPrice: 8000,
      deposit: {
        create: {
          amount: 5000,
          stripeSessionId: "cs_test_demo_004",
          stripePaymentId: "pi_test_demo_004",
          status: "PAID",
        },
      },
    },
  });

  await prisma.consentForm.create({
    data: {
      clientId: ana.id,
      appointmentId: cita4.id,
      signedContent:
        "Yo, el/la abajo firmante, declaro haber sido informado/a de los riesgos y cuidados del tatuaje...",
      signedAt: semanaPassada,
      signerName: "Ana Martínez",
      signatureIp: "192.168.1.100",
    },
  });

  // Cita 5: hace dos semanas, no se presentó
  await prisma.appointment.create({
    data: {
      studioId: studio.id,
      clientId: pedro.id,
      artistId: artist.id,
      dateTime: dosSemanasAtras,
      estimatedDuration: 60,
      status: "NO_SHOW",
      tattooDescription: "Lettering nombre en costado",
      estimatedPrice: 9000,
    },
  });

  // Recordatorio para la cita de mañana
  await prisma.reminder.create({
    data: {
      appointmentId: cita1.id,
      type: "EMAIL",
      status: "PENDING",
      scheduledFor: new Date(manana.getTime() - 24 * 60 * 60 * 1000),
    },
  });

  console.log(`✅ 5 citas creadas (confirmadas, pendientes, completadas, no-show)`);

  console.log("\n✨ Seed completado. Datos de acceso al demo:");
  console.log(`   Email:      ${DEMO_EMAIL}`);
  console.log(`   Contraseña: ${DEMO_PASSWORD}`);
  console.log(`   URL:        http://localhost:3000/login\n`);

  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
