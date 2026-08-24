import { createClient } from "@/lib/supabase/server";
import StatusBadge from "@/components/StatusBadge";
import {
  updateServiceOrderStage,
  addComment,
  uploadAttachment,
  deleteAttachment,
  addChecklistItem,
  toggleChecklistItem,
} from "../actions";
import { notFound } from "next/navigation";
import { getCurrentProfile } from "@/lib/profile";
import Link from "next/link";

const STAGE_FLOW = ["entrada", "arte", "aprovacao", "impressao", "producao", "instalacao", "financeiro", "concluido"];

const CATEGORY_LABELS: Record<string, string> = {
  arte: "Arte",
  impressao: "Impressão",
  producao: "Produção",
  geral: "Geral",
};

export default async function OrdemDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { erro?: string };
}) {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  const canViewFinancials = profile?.canViewFinancials ?? true;

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

  const { data: attachmentsRaw } = await supabase
    .from("attachments")
    .select("id, file_path, file_name, file_type, category, created_at")
    .eq("service_order_id", params.id)
    .order("created_at", { ascending: false });

  // gera link temporário (1h) pra cada arquivo, já que o bucket é privado
  const attachments = await Promise.all(
    (attachmentsRaw ?? []).map(async (a) => {
      const { data: signed } = await supabase.storage.from("attachments").createSignedUrl(a.file_path, 3600);
      return { ...a, url: signed?.signedUrl ?? null };
    })
  );

  let productionJob: any = null;
  let checklist: any[] = [];
  if (order.needs_production) {
    const { data: job } = await supabase
      .from("production_jobs")
      .select("id")
      .eq("service_order_id", params.id)
      .single();
    productionJob = job;
    if (job) {
      const { data: items } = await supabase
        .from("production_checklists")
        .select("*")
        .eq("production_job_id", job.id)
        .order("sort_order");
      checklist = items ?? [];
    }
  }

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
        <div className="flex items-center gap-2">
          <StatusBadge status={order.priority} />
          <StatusBadge status={order.current_stage} />
          <Link
            href={`/ordens/${order.id}/editar`}
            className="text-xs bg-black/40 border border-gardin-border rounded-lg px-3 py-1.5 text-gardin-white hover:border-gardin-gold transition"
          >
            ✏️ Editar
          </Link>
          <Link
            href={`/ordens/${order.id}/imprimir`}
            className="text-xs bg-black/40 border border-gardin-border rounded-lg px-3 py-1.5 text-gardin-white hover:border-gardin-gold transition"
          >
            🖨️ PDF
          </Link>
        </div>
      </div>

      {searchParams.erro && (
        <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
          {searchParams.erro}
        </div>
      )}

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

      {canViewFinancials && (
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
      )}

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

      {/* Arquivos (Arte, Impressão, Produção) */}
      <div className="bg-gardin-panel border border-gardin-border rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gardin-white mb-3">📎 Arquivos</h2>

        <form action={uploadAttachment} className="flex flex-wrap items-end gap-2 mb-4">
          <input type="hidden" name="order_id" value={order.id} />
          <div>
            <label className="block text-xs text-gardin-muted mb-1">Categoria</label>
            <select
              name="category"
              className="bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            >
              <option value="arte">Arte</option>
              <option value="impressao">Impressão</option>
              <option value="producao">Produção</option>
              <option value="geral">Geral</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gardin-muted mb-1">Arquivo (JPG ou PDF)</label>
            <input
              type="file"
              name="file"
              accept="image/jpeg,application/pdf"
              required
              className="text-xs text-gardin-white file:bg-black/40 file:border file:border-gardin-border file:rounded-lg file:px-3 file:py-2 file:text-gardin-white file:text-xs file:mr-2"
            />
          </div>
          <button
            type="submit"
            className="bg-gardin-gold hover:bg-gardin-goldLight text-black font-semibold text-xs px-4 py-2 rounded-lg transition"
          >
            Enviar
          </button>
        </form>

        {attachments.length === 0 ? (
          <p className="text-sm text-gardin-muted">Nenhum arquivo anexado ainda.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {attachments.map((a) => (
              <div key={a.id} className="bg-black/30 border border-gardin-border rounded-lg p-2">
                <p className="text-[10px] uppercase text-gardin-gold mb-1">{CATEGORY_LABELS[a.category] ?? a.category}</p>
                {a.url && a.file_type?.startsWith("image/") ? (
                  <a href={a.url} target="_blank" rel="noreferrer">
                    <img src={a.url} alt={a.file_name} className="w-full h-20 object-cover rounded" />
                  </a>
                ) : a.url ? (
                  <a
                    href={a.url}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-center h-20 text-3xl"
                  >
                    📄
                  </a>
                ) : (
                  <div className="flex items-center justify-center h-20 text-xs text-gardin-muted">
                    link expirado
                  </div>
                )}
                <p className="text-[10px] text-gardin-muted truncate mt-1">{a.file_name}</p>
                <form action={deleteAttachment}>
                  <input type="hidden" name="order_id" value={order.id} />
                  <input type="hidden" name="attachment_id" value={a.id} />
                  <input type="hidden" name="file_path" value={a.file_path} />
                  <button type="submit" className="text-[10px] text-red-400 hover:text-red-300">
                    Remover
                  </button>
                </form>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Checklist de Produção */}
      {order.needs_production && productionJob && (
        <div className="bg-gardin-panel border border-gardin-border rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-gardin-white mb-3">🛠️ Checklist de Produção</h2>

          <form action={addChecklistItem} className="flex gap-2 mb-4">
            <input type="hidden" name="order_id" value={order.id} />
            <input type="hidden" name="production_job_id" value={productionJob.id} />
            <input
              name="item_label"
              placeholder="Ex: Serraria, Pintura, Recorte de adesivo, Aplicação..."
              className="flex-1 bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
            <button className="bg-black/40 border border-gardin-border rounded-lg px-4 py-2 text-sm text-gardin-white hover:border-gardin-gold transition">
              + Adicionar etapa
            </button>
          </form>

          {checklist.length === 0 ? (
            <p className="text-sm text-gardin-muted">Nenhuma etapa de produção cadastrada ainda.</p>
          ) : (
            <div className="space-y-2">
              {checklist.map((item) => (
                <form
                  key={item.id}
                  action={toggleChecklistItem}
                  className="flex items-center gap-2 bg-black/30 border border-gardin-border rounded-lg px-3 py-2"
                >
                  <input type="hidden" name="order_id" value={order.id} />
                  <input type="hidden" name="item_id" value={item.id} />
                  <input type="hidden" name="is_done" value={String(item.is_done)} />
                  <button type="submit" className="text-lg leading-none">
                    {item.is_done ? "✅" : "⬜"}
                  </button>
                  <span
                    className={`text-sm flex-1 ${
                      item.is_done ? "text-gardin-muted line-through" : "text-gardin-white"
                    }`}
                  >
                    {item.item_label}
                  </span>
                </form>
              ))}
            </div>
          )}
        </div>
      )}

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
