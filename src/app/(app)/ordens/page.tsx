import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";

const STAGES = [
  { value: "", label: "Todas as etapas" },
  { value: "entrada", label: "Entrada" },
  { value: "arte", label: "Arte" },
  { value: "aprovacao", label: "Aprovação" },
  { value: "impressao", label: "Impressão" },
  { value: "producao", label: "Produção" },
  { value: "instalacao", label: "Instalação" },
  { value: "financeiro", label: "Financeiro" },
  { value: "concluido", label: "Concluído" },
];

export default async function OrdensPage({
  searchParams,
}: {
  searchParams: { etapa?: string; prioridade?: string };
}) {
  const supabase = createClient();

  let query = supabase
    .from("service_orders")
    .select("id, os_number, project_name, current_stage, priority, expected_completion_date, clients(name)")
    .order("created_at", { ascending: false });

  if (searchParams.etapa) query = query.eq("current_stage", searchParams.etapa);
  if (searchParams.prioridade) query = query.eq("priority", searchParams.prioridade);

  const { data: orders } = await query;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gardin-white">Ordens de Serviço</h1>
          <p className="text-sm text-gardin-muted">Todas as OS da empresa</p>
        </div>
        <Link
          href="/ordens/nova"
          className="bg-gardin-gold hover:bg-gardin-goldLight text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
        >
          + Nova Ordem de Serviço
        </Link>
      </div>

      <form className="flex flex-wrap gap-3 mb-4">
        <select
          name="etapa"
          defaultValue={searchParams.etapa ?? ""}
          className="bg-gardin-panel border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
        >
          {STAGES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <select
          name="prioridade"
          defaultValue={searchParams.prioridade ?? ""}
          className="bg-gardin-panel border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
        >
          <option value="">Todas as prioridades</option>
          <option value="normal">Normal</option>
          <option value="alta">Alta</option>
          <option value="urgente">Urgente</option>
        </select>
        <button className="bg-black/40 border border-gardin-border rounded-lg px-4 py-2 text-sm text-gardin-white hover:border-gardin-gold transition">
          Filtrar
        </button>
      </form>

      <div className="bg-gardin-panel border border-gardin-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/30 text-gardin-muted text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">OS</th>
              <th className="text-left px-4 py-3">Cliente</th>
              <th className="text-left px-4 py-3">Projeto</th>
              <th className="text-left px-4 py-3">Prazo</th>
              <th className="text-left px-4 py-3">Prioridade</th>
              <th className="text-left px-4 py-3">Etapa</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gardin-border">
            {(orders ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gardin-muted">
                  Nenhuma Ordem de Serviço encontrada.
                </td>
              </tr>
            )}
            {(orders ?? []).map((o: any) => (
              <tr key={o.id} className="hover:bg-black/20 transition cursor-pointer">
                <td className="px-4 py-3">
                  <Link href={`/ordens/${o.id}`} className="text-gardin-gold font-medium">
                    #{String(o.os_number).padStart(6, "0")}
                  </Link>
                </td>
                <td className="px-4 py-3 text-gardin-white">{o.clients?.name}</td>
                <td className="px-4 py-3 text-gardin-white">{o.project_name}</td>
                <td className="px-4 py-3 text-gardin-muted">
                  {o.expected_completion_date
                    ? new Date(o.expected_completion_date).toLocaleDateString("pt-BR")
                    : "-"}
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.priority} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={o.current_stage} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
