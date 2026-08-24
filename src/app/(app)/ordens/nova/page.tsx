import { createClient } from "@/lib/supabase/server";
import { createServiceOrder } from "../actions";
import { getCurrentProfile } from "@/lib/profile";

export default async function NovaOrdemPage({
  searchParams,
}: {
  searchParams: { erro?: string; cliente?: string };
}) {
  const supabase = createClient();
  const { data: clients } = await supabase.from("clients").select("id, name").order("name");
  const profile = await getCurrentProfile();
  const canViewFinancials = profile?.canViewFinancials ?? true;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gardin-white mb-6">Nova Ordem de Serviço</h1>

      {searchParams.erro && (
        <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
          {searchParams.erro}
        </div>
      )}

      {(clients ?? []).length === 0 && (
        <div className="mb-4 text-sm text-yellow-300 bg-yellow-950/30 border border-yellow-900 rounded-lg px-3 py-2">
          Nenhum cliente cadastrado ainda.{" "}
          <a href="/clientes/novo" className="underline">
            Cadastre um cliente primeiro
          </a>
          .
        </div>
      )}

      <form action={createServiceOrder} className="bg-gardin-panel border border-gardin-border rounded-xl p-6 space-y-6">
        {/* 1. Cliente */}
        <div>
          <label className="block text-xs text-gardin-muted mb-1">Cliente *</label>
          <select
            name="client_id"
            required
            className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
          >
            <option value="">Selecione um cliente</option>
            {(clients ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* 2/3. Serviço e detalhes */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gardin-muted mb-1">Nome do projeto *</label>
            <input
              name="project_name"
              required
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gardin-muted mb-1">Quantidade</label>
            <input
              type="number"
              name="quantity"
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-gardin-muted mb-1">Descrição completa</label>
          <textarea
            name="description"
            rows={3}
            className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gardin-muted mb-1">Medidas</label>
            <input
              name="measurements"
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gardin-muted mb-1">Material</label>
            <input
              name="material"
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
          </div>
        </div>

        {/* 4. Valor (só quem tem permissão financeira vê/preenche) */}
        {canViewFinancials && (
          <div>
            <label className="block text-xs text-gardin-muted mb-1">Valor total do serviço (R$)</label>
            <input
              type="number"
              step="0.01"
              name="total_value"
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
          </div>
        )}

        {/* 5. Etapas necessárias */}
        <div>
          <label className="block text-xs text-gardin-muted mb-2">Etapas necessárias</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              { name: "needs_art", label: "Criação de arte" },
              { name: "needs_printing", label: "Impressão" },
              { name: "needs_production", label: "Produção" },
              { name: "needs_installation", label: "Instalação" },
            ].map((step) => (
              <label
                key={step.name}
                className="flex items-center gap-2 bg-black/30 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white cursor-pointer"
              >
                <input type="checkbox" name={step.name} className="accent-gardin-gold" />
                {step.label}
              </label>
            ))}
          </div>
        </div>

        {/* 6/7. Prazo e prioridade */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gardin-muted mb-1">Prazo acordado</label>
            <input
              type="date"
              name="agreed_deadline"
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gardin-muted mb-1">Data prevista de conclusão</label>
            <input
              type="date"
              name="expected_completion_date"
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
          </div>
          <div>
            <label className="block text-xs text-gardin-muted mb-1">Prioridade</label>
            <select
              name="priority"
              defaultValue="normal"
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            >
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="bg-gardin-gold hover:bg-gardin-goldLight text-black font-semibold text-sm px-5 py-2.5 rounded-lg transition"
        >
          Criar Ordem de Serviço
        </button>
      </form>
    </div>
  );
}
