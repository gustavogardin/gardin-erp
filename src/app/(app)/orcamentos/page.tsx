import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

export default async function OrcamentosPage() {
  const supabase = createClient();

  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, quote_number, title, status, created_at, converted_order_id, clients(name)")
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gardin-white">Orçamentos</h1>
          <p className="text-sm text-gardin-muted">Monte, envie para aprovação e converta em OS</p>
        </div>
        <Link
          href="/orcamentos/novo"
          className="bg-gardin-gold hover:bg-gardin-goldLight text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
        >
          + Novo Orçamento
        </Link>
      </div>

      <div className="bg-gardin-panel border border-gardin-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/30 text-gardin-muted text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Nº</th>
              <th className="text-left px-4 py-3">Cliente</th>
              <th className="text-left px-4 py-3">Título</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="text-left px-4 py-3">OS gerada</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gardin-border">
            {(quotes ?? []).length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-gardin-muted">
                  Nenhum orçamento criado ainda.
                </td>
              </tr>
            )}
            {(quotes ?? []).map((q: any) => (
              <tr key={q.id} className="hover:bg-black/20 transition">
                <td className="px-4 py-3">
                  <Link href={`/orcamentos/${q.id}`} className="text-gardin-gold font-medium">
                    #{String(q.quote_number).padStart(5, "0")}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gardin-white">{q.clients?.name}</td>
                <td className="px-4 py-3 text-gardin-white">{q.title}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={q.status} />
                </td>
                <td className="px-4 py-3">
                  {q.converted_order_id ? (
                    <Link href={`/ordens/${q.converted_order_id}`} className="text-gardin-gold text-xs">
                      Ver OS →
                    </Link>
                  ) : (
                    <span className="text-gardin-muted text-xs">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
