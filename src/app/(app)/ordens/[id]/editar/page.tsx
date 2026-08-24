import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/profile";
import { updateServiceOrder } from "../../actions";
import { notFound } from "next/navigation";

export default async function EditarOrdemPage({
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
    .select("*, clients(name)")
    .eq("id", params.id)
    .single();

  if (!order) return notFound();

  const { data: financial } = await supabase
    .from("financials")
    .select("*")
    .eq("service_order_id", params.id)
    .single();

  const toDateInput = (d: string | null) => (d ? d.slice(0, 10) : "");

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gardin-white mb-1">
        Editar OS #{String(order.os_number).padStart(6, "0")}
      </h1>
      <p className="text-sm text-gardin-muted mb-6">{order.clients?.name}</p>

      {searchParams.erro && (
        <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
          {searchParams.erro}
        </div>
      )}

      <form action={updateServiceOrder} className="bg-gardin-panel border border-gardin-border rounded-xl p-6 space-y-6">
        <input type="hidden" name="order_id" value={order.id} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gardin-muted mb-1">Nome do projeto *</label>
            <input
              name="project_name"
              required
              defaultValue={order.project_name}
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gardin-muted mb-1">Quantidade</label>
            <input
              type="number"
              name="quantity"
              defaultValue={order.quantity ?? ""}
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gardin-muted mb-1">Descrição completa</label>
          <textarea
            name="description"
            rows={3}
            defaultValue={order.description ?? ""}
            className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gardin-muted mb-1">Medidas</label>
            <input
              name="measurements"
              defaultValue={order.measurements ?? ""}
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gardin-muted mb-1">Material</label>
            <input
              name="material"
              defaultValue={order.material ?? ""}
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gardin-muted mb-1">Prazo acordado</label>
            <input
              type="date"
              name="agreed_deadline"
              defaultValue={toDateInput(order.agreed_deadline)}
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gardin-muted mb-1">Data prevista de conclusão</label>
            <input
              type="date"
              name="expected_completion_date"
              defaultValue={toDateInput(order.expected_completion_date)}
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gardin-muted mb-1">Prioridade</label>
            <select
              name="priority"
              defaultValue={order.priority}
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            >
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>

        {canViewFinancials && (
          <div className="border-t border-gardin-border pt-6">
            <h2 className="text-sm font-semibold text-gardin-white mb-3">Financeiro</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs text-gardin-muted mb-1">Valor total (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  name="total_value"
                  defaultValue={financial?.total_value ?? 0}
                  className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gardin-muted mb-1">Desconto (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  name="discount"
                  defaultValue={financial?.discount ?? 0}
                  className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gardin-muted mb-1">Acréscimo (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  name="addition"
                  defaultValue={financial?.addition ?? 0}
                  className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gardin-muted mb-1">Status</label>
                <select
                  name="financial_status"
                  defaultValue={financial?.status ?? "nao_cobrado"}
                  className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
                >
                  <option value="nao_cobrado">Não cobrado</option>
                  <option value="a_cobrar">A cobrar</option>
                  <option value="cobranca_enviada">Cobrança enviada</option>
                  <option value="parcialmente_pago">Parcialmente pago</option>
                  <option value="pago">Pago</option>
                  <option value="vencido">Vencido</option>
                </select>
              </div>
            </div>
          </div>
        )}

        <button
          type="submit"
          className="bg-gardin-gold hover:bg-gardin-goldLight text-black font-semibold text-sm px-5 py-2.5 rounded-lg transition"
        >
          Salvar alterações
        </button>
      </form>
    </div>
  );
}
