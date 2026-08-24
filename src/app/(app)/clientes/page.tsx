import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const supabase = createClient();
  const q = searchParams.q?.trim();

  let query = supabase
    .from("clients")
    .select("id, name, trade_name, document, phone, city")
    .order("name");

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,trade_name.ilike.%${q}%,document.ilike.%${q}%,phone.ilike.%${q}%`
    );
  }

  const { data: clients } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gardin-white">Clientes</h1>
          <p className="text-sm text-gardin-muted">Base central de clientes</p>
        </div>
        <Link
          href="/clientes/novo"
          className="bg-gardin-gold hover:bg-gardin-goldLight text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
        >
          + Novo Cliente
        </Link>
      </div>

      <form className="mb-4">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nome, empresa, CPF/CNPJ ou telefone..."
          className="w-full max-w-md bg-gardin-panel border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white outline-none focus:border-gardin-gold transition"
        />
      </form>

      <div className="bg-gardin-panel border border-gardin-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/30 text-gardin-muted text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Documento</th>
              <th className="text-left px-4 py-3">Telefone</th>
              <th className="text-left px-4 py-3">Cidade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gardin-border">
            {(clients ?? []).length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-gardin-muted">
                  Nenhum cliente encontrado.
                </td>
              </tr>
            )}
            {(clients ?? []).map((c) => (
              <tr key={c.id} className="hover:bg-black/20 transition">
                <td className="px-4 py-3 text-gardin-white">
                  {c.name}
                  {c.trade_name && (
                    <span className="text-gardin-muted"> ({c.trade_name})</span>
                  )}
                </td>
                <td className="px-4 py-3 text-gardin-muted">{c.document ?? "-"}</td>
                <td className="px-4 py-3 text-gardin-muted">{c.phone ?? "-"}</td>
                <td className="px-4 py-3 text-gardin-muted">{c.city ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
