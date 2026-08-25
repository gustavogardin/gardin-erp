import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import Link from "next/link";
import { generateApprovalLink, convertQuoteToOrder } from "../actions";
import { getCurrentProfile } from "@/lib/profile";

export default async function OrcamentoDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { erro?: string };
}) {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  const canViewFinancials = profile?.canViewFinancials ?? true;

  const { data: quote } = await supabase
    .from("quotes")
    .select("*, clients(name, phone, email)")
    .eq("id", params.id)
    .single();

  if (!quote) return notFound();

  const { data: items } = await supabase
    .from("quote_items")
    .select("*")
    .eq("quote_id", params.id)
    .order("sort_order");

  const currency = (n: number) =>
    Number(n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  const total = (items ?? []).reduce((sum, i) => sum + Number(i.unit_value) * Number(i.quantity), 0);

  return (
    <div className="max-w-3xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gardin-white">
            Orçamento #{String(quote.quote_number).padStart(5, "0")}
          </h1>
          <p className="text-sm text-gardin-muted">{quote.clients?.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={quote.status} />
          <Link
            href={`/orcamentos/${quote.id}/imprimir`}
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

      <div className="bg-gardin-panel border border-gardin-border rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gardin-white mb-3">{quote.title}</h2>
        <div className="space-y-3">
          {(items ?? []).map((item: any) => (
            <div key={item.id} className="border-t border-gardin-border pt-3 first:border-t-0 first:pt-0">
              <div className="flex justify-between text-sm">
                <p className="text-gardin-white font-medium">
                  {item.name} {item.measurements ? `— ${item.measurements}` : ""}
                </p>
                {canViewFinancials && (
                  <p className="text-gardin-gold font-medium">
                    {currency(item.unit_value * item.quantity)}
                  </p>
                )}
              </div>
              <p className="text-xs text-gardin-muted">Qtd: {item.quantity}</p>
              {item.technical_description && (
                <ul className="text-xs text-gardin-muted list-disc list-inside mt-1">
                  {item.technical_description.split("\n").filter(Boolean).map((line: string, i: number) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
        {canViewFinancials && (
          <div className="text-right border-t border-gardin-border pt-3 mt-3">
            <span className="text-sm text-gardin-muted mr-2">Total:</span>
            <span className="text-lg font-bold text-gardin-gold">{currency(total)}</span>
          </div>
        )}
      </div>

      {/* Link de aprovação */}
      <div className="bg-gardin-panel border border-gardin-border rounded-xl p-5 mb-6">
        <h2 className="font-semibold text-gardin-white mb-3">Aprovação do cliente</h2>
        {quote.status === "aprovado" ? (
          <p className="text-sm text-green-400">
            ✅ Aprovado por {quote.approved_by_name} em{" "}
            {quote.approved_at ? new Date(quote.approved_at).toLocaleString("pt-BR") : ""}
          </p>
        ) : quote.status === "rejeitado" ? (
          <p className="text-sm text-red-400">
            ❌ Rejeitado. Motivo: {quote.rejection_reason || "não informado"}
          </p>
        ) : quote.approval_token ? (
          <div className="text-sm">
            <p className="text-gardin-muted mb-2">Link para o cliente aprovar (sem precisar login):</p>
            <ApprovalLinkBox token={quote.approval_token} />
          </div>
        ) : (
          <form action={generateApprovalLink}>
            <input type="hidden" name="quote_id" value={quote.id} />
            <button
              type="submit"
              className="bg-gardin-gold hover:bg-gardin-goldLight text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
            >
              Gerar link de aprovação
            </button>
          </form>
        )}
      </div>

      {/* Converter em OS */}
      {quote.status === "aprovado" && !quote.converted_order_id && (
        <form action={convertQuoteToOrder}>
          <input type="hidden" name="quote_id" value={quote.id} />
          <button
            type="submit"
            className="bg-gardin-gold hover:bg-gardin-goldLight text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
          >
            ✅ Converter em Ordem de Serviço
          </button>
        </form>
      )}

      {quote.converted_order_id && (
        <Link
          href={`/ordens/${quote.converted_order_id}`}
          className="inline-block bg-black/40 border border-gardin-border rounded-lg px-4 py-2 text-sm text-gardin-white hover:border-gardin-gold transition"
        >
          Ver Ordem de Serviço gerada →
        </Link>
      )}
    </div>
  );
}

function ApprovalLinkBox({ token }: { token: string }) {
  return (
    <div className="bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-xs text-gardin-gold break-all">
      /aprovar/orcamento/{token}
      <p className="text-gardin-muted mt-1">
        Copie o endereço do site (ex: https://gardin-erp.vercel.app) + esse caminho e envie ao cliente.
      </p>
    </div>
  );
}
