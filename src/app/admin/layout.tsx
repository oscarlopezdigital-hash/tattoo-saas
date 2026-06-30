import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.email !== process.env.SUPERADMIN_EMAIL) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">A</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Panel Admin</p>
            <p className="text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
        <form action="/api/auth/logout" method="POST">
          <button className="text-xs text-gray-400 hover:text-gray-600">Cerrar sesión</button>
        </form>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-8">{children}</main>
    </div>
  );
}
