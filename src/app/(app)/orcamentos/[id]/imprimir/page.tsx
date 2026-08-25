import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";
import { COMPANY } from "@/lib/company";
import { getCurrentProfile } from "@/lib/profile";

const currency = (n: number) =>
  Number(n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default async function ImprimirOrcamentoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  const canViewFinancials = profile?.canViewFinancials ?? true;

  const { data: quote } = await supabase
    .from("quotes")
    .select("*, clients(name)")
    .eq("id", params.id)
    .single();

  if (!quote) return notFound();

  const { data: items } = await supabase
    .from("quote_items")
    .select("*")
    .eq("quote_id", params.id)
    .order("sort_order");

  const total = (items ?? []).reduce((sum, i) => sum + Number(i.unit_value) * Number(i.quantity), 0);

  return (
    <div className="bg-black/20 print:bg-white min-h-screen py-8 px-4 print:p-0">
      <div className="max-w-3xl mx-auto mb-4 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="max-w-3xl mx-auto bg-white text-black print:rounded-none shadow-xl print:shadow-none overflow-hidden">
        {/* Faixa de cabeçalho estilo Gardin */}
        <div className="bg-black text-white px-8 py-6 flex items-center justify-between">
          <div>
            <p className="font-bold text-xl tracking-wide">GARDIN</p>
            <p className="text-xs text-gray-300">COMUNICAÇÃO VISUAL</p>
          </div>
          <div className="w-3 h-14 bg-gardin-gold" />
        </div>

        <div className="p-8">
          <h1 className="text-2xl font-bold mb-1">ORÇAMENTO - COMUNICAÇÃO VISUAL</h1>
          {quote.service_summary && <p className="text-sm text-gray-600 mb-4">{quote.service_summary}</p>}

          <div className="grid grid-cols-3 gap-px bg-gray-300 border border-gray-300 text-sm mb-6">
            <div className="bg-yellow-50 p-3">
              <p className="text-xs text-gray-500">Cliente</p>
              <p className="font-medium">{quote.clients?.name}</p>
            </div>
            <div className="bg-yellow-50 p-3">
              <p className="text-xs text-gray-500">Serviço</p>
              <p className="font-medium">{quote.title}</p>
            </div>
            <div className="bg-yellow-50 p-3">
              <p className="text-xs text-gray-500">Acabamento</p>
              <p className="font-medium">{quote.finishing ?? "-"}</p>
            </div>
          </div>

          {(items ?? []).map((item: any, index: number) => (
            <div key={item.id} className="mb-5">
              <h2 className="font-bold text-base mb-2">
                {index + 1}. {item.name.toUpperCase()}
                {item.measurements ? ` - ${item.measurements}` : ""}
                {item.quantity > 1 ? ` (${item.quantity} UNIDADES)` : ""}
              </h2>
              {item.technical_description && (
                <ul className="text-sm list-disc list-inside space-y-0.5 mb-2">
                  {item.technical_description
                    .split("\n")
                    .filter(Boolean)
                    .map((line: string, i: number) => (
                      <li key={i}>{line};</li>
                    ))}
                </ul>
              )}
              {canViewFinancials && (
                <div className="bg-yellow-50 border border-yellow-300 text-sm px-3 py-1.5">
                  {item.quantity > 1 ? "Valor unitário" : "Valor"}: {currency(item.unit_value)}
                </div>
              )}
            </div>
          ))}

          {canViewFinancials && (
            <div className="border-t-2 border-black pt-4 mt-6">
              <p className="text-sm font-bold mb-2">INVESTIMENTO TOTAL</p>
              <p className="text-2xl font-bold mb-3">{currency(total)}</p>
              <div className="text-sm space-y-1">
                {(items ?? []).map((item: any) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {item.quantity}x {item.name}
                    </span>
                    <span>{currency(item.unit_value * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {quote.deadline_estimate && (
            <div className="mt-4 text-sm">
              <p className="font-bold">Prazo estimado</p>
              <p>{quote.deadline_estimate}</p>
            </div>
          )}

          {quote.notes && (
            <div className="mt-4 text-sm">
              <p className="font-bold">Observações</p>
              <p className="text-gray-700">{quote.notes}</p>
            </div>
          )}

          <p className="text-xs text-gray-400 text-center mt-8 border-t border-gray-200 pt-4">
            {COMPANY.name} — {COMPANY.phone}
          </p>
        </div>
      </div>
    </div>
  );
}
