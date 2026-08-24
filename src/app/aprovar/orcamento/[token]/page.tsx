import { createAdminClient } from "@/lib/supabase/admin";
import Image from "next/image";
import { approveQuote, rejectQuote } from "./actions";
import { COMPANY } from "@/lib/company";

const currency = (n: number) =>
  Number(n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default async function AprovarOrcamentoPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams: { erro?: string };
}) {
  const supabase = createAdminClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("*, clients(name)")
    .eq("approval_token", params.token)
    .single();

  if (!quote) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gardin-black text-gardin-white px-4">
        <p>Link inválido ou expirado.</p>
      </div>
    );
  }

  const { data: items } = await supabase
    .from("quote_items")
    .select("*")
    .eq("quote_id", quote.id)
    .order("sort_order");

  const total = (items ?? []).reduce((sum, i) => sum + Number(i.unit_value) * Number(i.quantity), 0);

  return (
    <div className="min-h-screen bg-gardin-black py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-center mb-6">
          <Image src="/logo.png" alt={COMPANY.name} width={100} height={100} />
        </div>

        <div className="bg-gardin-panel border border-gardin-border rounded-2xl p-6 md:p-8">
          <h1 className="text-xl font-bold text-gardin-white mb-1">{quote.title}</h1>
          <p className="text-sm text-gardin-muted mb-6">Para: {quote.clients?.name}</p>

          {searchParams.erro && (
            <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
              {searchParams.erro}
            </div>
          )}

          <div className="space-y-4 mb-6">
            {(items ?? []).map((item: any) => (
              <div key={item.id} className="border-b border-gardin-border pb-4 last:border-b-0">
                <div className="flex justify-between text-sm mb-1">
                  <p className="text-gardin-white font-medium">
                    {item.name} {item.measurements ? `— ${item.measurements}` : ""}
                  </p>
                  <p className="text-gardin-gold font-medium">{currency(item.unit_value * item.quantity)}</p>
                </div>
                {item.technical_description && (
                  <ul className="text-xs text-gardin-muted list-disc list-inside">
                    {item.technical_description.split("\n").filter(Boolean).map((line: string, i: number) => (
                      <li key={i}>{line}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="text-right mb-6">
            <span className="text-sm text-gardin-muted mr-2">Total:</span>
            <span className="text-2xl font-bold text-gardin-gold">{currency(total)}</span>
          </div>

          {quote.deadline_estimate && (
            <p className="text-sm text-gardin-muted mb-6">
              <span className="font-medium text-gardin-white">Prazo estimado: </span>
              {quote.deadline_estimate}
            </p>
          )}

          {quote.status === "aprovado" ? (
            <div className="bg-green-950/40 border border-green-900 rounded-lg px-4 py-3 text-center">
              <p className="text-green-400 font-medium">✅ Orçamento aprovado</p>
              <p className="text-xs text-gardin-muted mt-1">
                Por {quote.approved_by_name} em{" "}
                {quote.approved_at ? new Date(quote.approved_at).toLocaleString("pt-BR") : ""}
              </p>
            </div>
          ) : quote.status === "rejeitado" ? (
            <div className="bg-red-950/40 border border-red-900 rounded-lg px-4 py-3 text-center">
              <p className="text-red-400 font-medium">Orçamento não aprovado</p>
            </div>
          ) : (
            <div className="space-y-4">
              <form action={approveQuote} className="space-y-2">
                <input type="hidden" name="token" value={params.token} />
                <input
                  name="approver_name"
                  placeholder="Seu nome completo"
                  required
                  className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
                />
                <button
                  type="submit"
                  className="w-full bg-gardin-gold hover:bg-gardin-goldLight text-black font-semibold rounded-lg py-2.5 text-sm transition"
                >
                  ✅ Aprovar orçamento
                </button>
              </form>

              <details className="text-sm text-gardin-muted">
                <summary className="cursor-pointer">Não aprovar / solicitar alteração</summary>
                <form action={rejectQuote} className="mt-2 space-y-2">
                  <input type="hidden" name="token" value={params.token} />
                  <textarea
                    name="rejection_reason"
                    placeholder="O que você gostaria de mudar?"
                    rows={2}
                    className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
                  />
                  <button
                    type="submit"
                    className="w-full bg-black/40 border border-gardin-border rounded-lg py-2 text-sm text-gardin-white hover:border-red-400 transition"
                  >
                    Enviar
                  </button>
                </form>
              </details>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gardin-muted mt-6">{COMPANY.name}</p>
      </div>
    </div>
  );
}
