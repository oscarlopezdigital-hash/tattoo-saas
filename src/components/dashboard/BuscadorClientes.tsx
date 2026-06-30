"use client";

import { useRouter, usePathname } from "next/navigation";
import { useCallback, useState } from "react";

export default function BuscadorClientes({ valorInicial }: { valorInicial: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [valor, setValor] = useState(valorInicial);

  const buscar = useCallback((texto: string) => {
    setValor(texto);
    const params = new URLSearchParams();
    if (texto) params.set("q", texto);
    router.push(`${pathname}?${params.toString()}`);
  }, [pathname, router]);

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
      <input
        type="search"
        value={valor}
        onChange={e => buscar(e.target.value)}
        placeholder="Buscar por nombre, teléfono o email..."
        className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
    </div>
  );
}
