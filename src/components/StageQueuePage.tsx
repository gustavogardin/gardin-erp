import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { updateServiceOrderStage } from "@/app/(app)/ordens/actions";

const NEXT_STAGE: Record<string, string> = {
  arte: "aprovacao",
  impressao: "producao",
  producao: "instalacao",
  instalacao: "financeiro",
};

const NEXT_LABEL: Record<string, string> = {
  aprovacao: "Aguardando aprovação",
  producao: "Produção",
  instalacao: "Instalação",
  financeiro: "Financeiro",
};

export default async function StageQueuePage({
  stage,
  title,
  emoji,
}: {
  stage: "arte" | "impressao" | "producao" | "instalacao";
  title: string;
  emoji: string;
}) {
  const supabase = createClient();

  const { data: orders } = await supabase
    .from("service_orders")
    .select("id, os_number, project_name, priority, expected_completion_date, clients(name)")
    .eq("current_stage", stage)
    .order("priority", { ascending: false })
    .order("expected_completion_date", { ascending: true });

  const nextStage = NEXT_STAGE[stage];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gardin-white">
          {emoji} {title}
        </h1>
        <p className="text-sm text-gardin-muted">
          Ordens de Serviço atualmente nesta etapa
        </p>
      </div>

      <div className="bg-gardin-panel border border-gardin-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-black/30 text-gardin-muted text-xs uppercase">
            <tr>
              <th className="text-left px-4 py-3">OS</th>
              <th className="text-left px-4 py-3">Cliente</th>
              <th className="text-left px-4 py-3">Projeto</th>
              <th className="text-left px-4 py-3">Prazo</th>
              <th className="text-left px-4 py-3">Prioridade</th>
              <th className="text-left px-4 py-3">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gardin-border">
            {(orders ?? []).length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gardin-muted">
                  Nenhuma OS nesta etapa no momento.
                </td>
              </tr>
            )}
            {(orders ?? []).map((o: any) => (
              <tr key={o.id} className="hover:bg-black/20 transition">
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
                  <form action={updateServiceOrderStage}>
                    <input type="hidden" name="order_id" value={o.id} />
                    <input type="hidden" name="stage" value={nextStage} />
                    <button
                      type="submit"
                      className="text-xs bg-black/40 border border-gardin-border rounded-lg px-3 py-1.5 text-gardin-white hover:border-gardin-gold transition"
                    >
                      Avançar → {NEXT_LABEL[nextStage]}
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
