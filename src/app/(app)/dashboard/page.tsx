import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import { getCurrentProfile } from "@/lib/profile";

function Kpi({ label, value, accent }: { label: string; value: string | number; accent?: boolean }) {
  return (
    <div className="bg-gardin-panel border border-gardin-border rounded-xl p-4">
      <p className="text-xs text-gardin-muted mb-1">{label}</p>
      <p className={`text-2xl font-bold ${accent ? "text-gardin-gold" : "text-gardin-white"}`}>{value}</p>
    </div>
  );
}

export default async function DashboardPage() {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  const canViewFinancials = profile?.canViewFinancials ?? true;

  const { data: orders } = await supabase
    .from("service_orders")
    .select("id, os_number, project_name, current_stage, priority, is_completed, expected_completion_date, created_at, clients(name)")
    .order("created_at", { ascending: false })
    .limit(8);

  const { count: totalOpen } = await supabase
    .from("service_orders")
    .select("id", { count: "exact", head: true })
    .eq("is_completed", false);

  const { count: waitingArt } = await supabase
    .from("service_orders")
    .select("id", { count: "exact", head: true })
    .eq("current_stage", "arte");

  const { count: waitingApproval } = await supabase
    .from("service_orders")
    .select("id", { count: "exact", head: true })
    .eq("current_stage", "aprovacao");

  const { count: inPrinting } = await supabase
    .from("service_orders")
    .select("id", { count: "exact", head: true })
    .eq("current_stage", "impressao");

  const { count: inProduction } = await supabase
    .from("service_orders")
    .select("id", { count: "exact", head: true })
    .eq("current_stage", "producao");

  const { count: inInstallation } = await supabase
    .from("service_orders")
    .select("id", { count: "exact", head: true })
    .eq("current_stage", "instalacao");

  const { count: completed } = await supabase
    .from("service_orders")
    .select("id", { count: "exact", head: true })
    .eq("is_completed", true);

  let receivable = 0;
  let received = 0;
  if (canViewFinancials) {
    const { data: financials } = await supabase.from("financials").select("final_value, status");
    receivable = (financials ?? [])
      .filter((f) => f.status !== "pago")
      .reduce((sum, f) => sum + Number(f.final_value ?? 0), 0);
    received = (financials ?? [])
      .filter((f) => f.status === "pago")
      .reduce((sum, f) => sum + Number(f.final_value ?? 0), 0);
  }

  const currency = (n: number) =>
    n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gardin-white">Dashboard</h1>
          <p className="text-sm text-gardin-muted">Visão geral da operação</p>
        </div>
        <Link
          href="/ordens/nova"
          className="bg-gardin-gold hover:bg-gardin-goldLight text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
        >
          + Nova Ordem de Serviço
        </Link>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Kpi label="OS abertas" value={totalOpen ?? 0} accent />
        <Kpi label="Aguardando arte" value={waitingArt ?? 0} />
        <Kpi label="Aguardando aprovação" value={waitingApproval ?? 0} />
        <Kpi label="Em impressão" value={inPrinting ?? 0} />
        <Kpi label="Em produção" value={inProduction ?? 0} />
        <Kpi label="Em instalação" value={inInstallation ?? 0} />
        <Kpi label="Concluídas" value={completed ?? 0} />
        {canViewFinancials && <Kpi label="A receber" value={currency(receivable)} accent />}
      </div>

      {canViewFinancials && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Kpi label="Total recebido" value={currency(received)} />
          <Kpi label="Total a receber" value={currency(receivable)} />
        </div>
      )}

      <div className="bg-gardin-panel border border-gardin-border rounded-xl">
        <div className="px-5 py-4 border-b border-gardin-border">
          <h2 className="font-semibold text-gardin-white">Ordens de Serviço recentes</h2>
        </div>
        <div className="divide-y divide-gardin-border">
          {(orders ?? []).length === 0 && (
            <p className="text-sm text-gardin-muted px-5 py-6">Nenhuma OS cadastrada ainda.</p>
          )}
          {(orders ?? []).map((o: any) => (
            <Link
              key={o.id}
              href={`/ordens/${o.id}`}
              className="flex items-center justify-between px-5 py-3 hover:bg-black/30 transition"
            >
              <div>
                <p className="text-sm font-medium text-gardin-white">
                  OS #{String(o.os_number).padStart(6, "0")} — {o.project_name}
                </p>
                <p className="text-xs text-gardin-muted">{o.clients?.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={o.priority} />
                <StatusBadge status={o.current_stage} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
