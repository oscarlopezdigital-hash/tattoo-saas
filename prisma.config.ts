import dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Prisma CLI no carga .env.local automáticamente (eso lo hace Next.js)
// Lo cargamos manualmente aquí para que migrate dev funcione
dotenv.config({ path: ".env.local" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // URL directa para migraciones (sin pgbouncer)
    url: process.env["DIRECT_URL"],
  },
});
