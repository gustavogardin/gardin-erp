import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";
import { updateServiceOrderStage, addComment } from "../actions";
import { notFound } from "next/navigation";

const STAGE_FLOW = ["entrada", "arte", "aprovacao", "impressao", "producao", "instalacao", "financeiro", "concluido"];

export default async function OrdemDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: order } = await supabase
    .from("service_orders")
    .select("*, clients(name, phone, whatsapp, email, address)")
    .eq("id", params.id)
    .single();

  if (!order) return notFound();

  const { data: financial } = await supabase
    .from("financials")
    .select("*")
    .eq("service_order_id", params.id)
    .single();

  const { data: logs } = await supabase
    .from("audit_logs")
    .select("action, details, created_at")
    .eq("service_order_id", params.id)
    .order("created_at", { ascending: false });

  const { data: comments } = await supabase
    .from("comments")
    .select("content, created_at, profiles(full_name)")
    .eq("service_order_id", params.id)
    .order("created_at", { ascending: false });

  const currency = (n: number) =>
    Number(n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const currentIndex = STAGE_FLOW.indexOf(order.current_stage);
  const nextStage = STAGE_FLOW[currentIndex + 1];

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gardin-white">
            OS #{String(order.os_number).padStart(6, "0")} — {order.project_name}
          </h1>
          <p className="text-sm text-gardin-muted">{order.clients?.name}</p>
        </div>
        <div className="flex gap-2">
          <StatusBadge status={order.priority} />
          <StatusBadge status={order.current_stage} />
        </div>
      </div>

      {/* Avançar etapa */}
      {nextStage && (
        <form action={updateServiceOrderStage} className="mb-6">
          <input type="hidden" name="order_id" value={order.id} />
          <input type="hidden" name="stage" value={nextStage} />
          <button
            type="submit"
            className="bg-gardin-gold hover:bg-gardin-goldLight text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
          >
            Avançar para: {labelStage(nextStage)} →
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gardin-panel border border-gardin-border rounded-xl p-5">
          <h2 className="font-semibold text-gardin-white mb-3">Cliente</h2>
          <dl className="text-sm space-y-1">
            <Row label="Nome" value={order.clients?.name} />
            <Row label="Telefone" value={order.clients?.phone} />
            <Row label="WhatsApp" value={order.clients?.whatsapp} />
            <Row label="E-mail" value={order.clients?.email} />
            <Row label="Endereço" value={order.clients?.address} />
          </dl>
        </div>

        <div className="bg-gardin-panel border border-gardin-border rounded-xl p-5">
          <h2 className="font-semibold text-gardin-white mb-3">Trabalho</h2>
          <dl className="text-sm space-y-1">
            <Row label="Descrição" value={order.description} />
            <Row label="Quantidade" value={order.quantity} />
            <Row label="Medidas" value={order.measurements} />
            <Row label="Material" value={order.material} />
            <Row
              label="Prazo acordado"
              value={order.agreed_deadline ? new Date(order.agreed_deadline).toLocaleDateString("pt-BR") : "-"}
            />
          </dl>
        </div>
      </div>

      <div className="bg-gardin-panel border border-gardin-border rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gardin-white mb-3">Financeiro</h2>
        <dl className="text-sm grid grid-cols-2 md:grid-cols-4 gap-3">
          <Row label="Valor total" value={currency(financial?.total_value)} />
          <Row label="Desconto" value={currency(financial?.discount)} />
          <Row label="Valor final" value={currency(financial?.final_value)} />
          <div>
            <dt className="text-gardin-muted text-xs">Status</dt>
            <dd>
              <StatusBadge status={financial?.status ?? "nao_cobrado"} />
            </dd>
          </div>
        </dl>
      </div>

      <div className="bg-gardin-panel border border-gardin-border rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gardin-white mb-3">Comentários internos</h2>
        <form action={addComment} className="flex gap-2 mb-4">
          <input type="hidden" name="order_id" value={order.id} />
          <input
            name="content"
            placeholder="Escreva um comentário..."
            className="flex-1 bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
          />
          <button className="bg-black/40 border border-gardin-border rounded-lg px-4 py-2 text-sm text-gardin-white hover:border-gardin-gold transition">
            Enviar
          </button>
        </form>
        <div className="space-y-3">
          {(comments ?? []).length === 0 && (
            <p className="text-sm text-gardin-muted">Nenhum comentário ainda.</p>
          )}
          {(comments ?? []).map((c: any, i: number) => (
            <div key={i} className="text-sm">
              <p className="text-gardin-white">{c.content}</p>
              <p className="text-xs text-gardin-muted">
                {c.profiles?.full_name ?? "Usuário"} — {new Date(c.created_at).toLocaleString("pt-BR")}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gardin-panel border border-gardin-border rounded-xl p-5">
        <h2 className="font-semibold text-gardin-white mb-3">Linha do tempo</h2>
        <div className="space-y-2">
          {(logs ?? []).length === 0 && (
            <p className="text-sm text-gardin-muted">Sem histórico ainda.</p>
          )}
          {(logs ?? []).map((l: any, i: number) => (
            <div key={i} className="text-xs text-gardin-muted flex gap-2">
              <span>{new Date(l.created_at).toLocaleString("pt-BR")}</span>
              <span>—</span>
              <span className="text-gardin-white">{describeAction(l)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: any }) {
  return (
    <div>
      <dt className="text-gardin-muted text-xs">{label}</dt>
      <dd className="text-gardin-white">{value ?? "-"}</dd>
    </div>
  );
}

function labelStage(stage: string) {
  const map: Record<string, string> = {
    entrada: "Entrada",
    arte: "Arte",
    aprovacao: "Aprovação",
    impressao: "Impressão",
    producao: "Produção",
    instalacao: "Instalação",
    financeiro: "Financeiro",
    concluido: "Concluído",
  };
  return map[stage] ?? stage;
}

function describeAction(log: { action: string; details: any }) {
  if (log.action === "os_criada") return "OS criada";
  if (log.action === "mudanca_estagio")
    return `Etapa alterada de ${labelStage(log.details?.de)} para ${labelStage(log.details?.para)}`;
  return log.action;
}
