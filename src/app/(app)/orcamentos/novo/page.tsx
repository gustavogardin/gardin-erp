import { createClient } from "@/lib/supabase/server";
import { createQuote } from "../actions";
import QuoteItemsForm from "@/components/QuoteItemsForm";

export default async function NovoOrcamentoPage({
  searchParams,
}: {
  searchParams: { erro?: string };
}) {
  const supabase = createClient();
  const { data: clients } = await supabase.from("clients").select("id, name").order("name");

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gardin-white mb-6">Novo Orçamento</h1>

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

      <form action={createQuote} className="space-y-6">
        <div className="bg-gardin-panel border border-gardin-border rounded-xl p-6 space-y-4">
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

          <div>
            <label className="block text-xs text-gardin-muted mb-1">Título do orçamento *</label>
            <input
              name="title"
              required
              placeholder="Ex: Placas institucionais e elemento recortado"
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
          </div>

          <div>
            <label className="block text-xs text-gardin-muted mb-1">Resumo do serviço</label>
            <input
              name="service_summary"
              placeholder="Ex: Placas + elemento recortado"
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gardin-muted mb-1">Acabamento</label>
              <input
                name="finishing"
                placeholder="Ex: ACM aço escovado / UV"
                className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gardin-muted mb-1">Prazo estimado</label>
              <input
                name="deadline_estimate"
                placeholder="Ex: Até 15 dias úteis após aprovação"
                className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gardin-muted mb-1">Válido até</label>
            <input
              type="date"
              name="valid_until"
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
          </div>

          <div>
            <label className="block text-xs text-gardin-muted mb-1">Observações</label>
            <textarea
              name="notes"
              rows={2}
              placeholder="Ex: Alterações de medidas, layout ou estrutura poderão ser avaliadas separadamente."
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gardin-white mb-3">Itens do orçamento</h2>
          <QuoteItemsForm />
        </div>

        <button
          type="submit"
          className="bg-gardin-gold hover:bg-gardin-goldLight text-black font-semibold text-sm px-5 py-2.5 rounded-lg transition"
        >
          Salvar Orçamento
        </button>
      </form>
    </div>
  );
}
