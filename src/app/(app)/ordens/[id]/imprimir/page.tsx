import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import PrintButton from "@/components/PrintButton";
import { COMPANY } from "@/lib/company";
import { getCurrentProfile } from "@/lib/profile";

const currency = (n: number) =>
  Number(n ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const dateBR = (d: string | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "-");

export default async function ImprimirOrdemPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const profile = await getCurrentProfile();
  const canViewFinancials = profile?.canViewFinancials ?? true;

  const { data: order } = await supabase
    .from("service_orders")
    .select("*, clients(name, trade_name, phone, whatsapp, email, address, city, document)")
    .eq("id", params.id)
    .single();

  if (!order) return notFound();

  const { data: financial } = await supabase
    .from("financials")
    .select("*")
    .eq("service_order_id", params.id)
    .single();

  const stages = [
    { key: "needs_art", label: "Criação de arte" },
    { key: "needs_printing", label: "Impressão" },
    { key: "needs_production", label: "Produção" },
    { key: "needs_installation", label: "Instalação" },
  ];

  return (
    <div className="bg-black/20 print:bg-white min-h-screen py-8 px-4 print:p-0">
      <div className="max-w-3xl mx-auto mb-4 flex justify-end print:hidden">
        <PrintButton />
      </div>

      <div className="max-w-3xl mx-auto bg-white text-black rounded-xl print:rounded-none shadow-xl print:shadow-none p-8 print:p-6">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between border-b-2 border-black pb-4 mb-4">
          <div className="flex items-center gap-3">
            <Image src="/logo.png" alt={COMPANY.name} width={64} height={64} />
            <div>
              <p className="font-bold text-lg leading-tight">{COMPANY.name}</p>
              <p className="text-xs text-gray-600">{COMPANY.phone}</p>
              {COMPANY.cnpj && <p className="text-xs text-gray-600">CNPJ: {COMPANY.cnpj}</p>}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">ORDEM DE SERVIÇO</p>
            <p className="text-2xl font-bold">#{String(order.os_number).padStart(6, "0")}</p>
            <p className="text-xs text-gray-500">Data: {dateBR(order.entry_date)}</p>
          </div>
        </div>

        {/* Cliente */}
        <div className="grid grid-cols-2 gap-4 text-sm mb-4">
          <div>
            <p>
              <span className="font-semibold">Cliente: </span>
              {order.clients?.name}
              {order.clients?.trade_name ? ` (${order.clients.trade_name})` : ""}
            </p>
            <p>
              <span className="font-semibold">Documento: </span>
              {order.clients?.document ?? "-"}
            </p>
            <p>
              <span className="font-semibold">Endereço: </span>
              {order.clients?.address ?? "-"} {order.clients?.city ? `- ${order.clients.city}` : ""}
            </p>
          </div>
          <div>
            <p>
              <span className="font-semibold">Telefone: </span>
              {order.clients?.phone ?? "-"}
            </p>
            <p>
              <span className="font-semibold">WhatsApp: </span>
              {order.clients?.whatsapp ?? "-"}
            </p>
            <p>
              <span className="font-semibold">E-mail: </span>
              {order.clients?.email ?? "-"}
            </p>
          </div>
        </div>

        {/* Item / projeto */}
        <table className="w-full text-sm border border-gray-300 mb-4">
          <thead className="bg-gray-100">
            <tr>
              <th className="border border-gray-300 px-2 py-1 text-left">Projeto</th>
              <th className="border border-gray-300 px-2 py-1 text-left">Descrição</th>
              <th className="border border-gray-300 px-2 py-1 text-left">Qtde</th>
              <th className="border border-gray-300 px-2 py-1 text-left">Medidas</th>
              <th className="border border-gray-300 px-2 py-1 text-left">Material</th>
              {canViewFinancials && <th className="border border-gray-300 px-2 py-1 text-right">Valor</th>}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-2 py-1">{order.project_name}</td>
              <td className="border border-gray-300 px-2 py-1">{order.description ?? "-"}</td>
              <td className="border border-gray-300 px-2 py-1">{order.quantity ?? "-"}</td>
              <td className="border border-gray-300 px-2 py-1">{order.measurements ?? "-"}</td>
              <td className="border border-gray-300 px-2 py-1">{order.material ?? "-"}</td>
              {canViewFinancials && (
                <td className="border border-gray-300 px-2 py-1 text-right">
                  {financial ? currency(financial.total_value) : "-"}
                </td>
              )}
            </tr>
          </tbody>
        </table>

        {canViewFinancials && financial && (
          <div className="flex justify-end text-sm mb-4">
            <div className="w-64">
              <div className="flex justify-between">
                <span>Desconto</span>
                <span>{currency(financial.discount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Acréscimo</span>
                <span>{currency(financial.addition)}</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t border-gray-300 pt-1">
                <span>TOTAL</span>
                <span>{currency(financial.final_value)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Prazos e prioridade */}
        <div className="grid grid-cols-3 gap-4 text-sm mb-4 border-t border-gray-300 pt-4">
          <p>
            <span className="font-semibold">Prazo acordado: </span>
            {dateBR(order.agreed_deadline)}
          </p>
          <p>
            <span className="font-semibold">Previsão de conclusão: </span>
            {dateBR(order.expected_completion_date)}
          </p>
          <p>
            <span className="font-semibold">Prioridade: </span>
            {order.priority}
          </p>
        </div>

        {order.technical_notes && (
          <p className="text-sm mb-4">
            <span className="font-semibold">Observações técnicas: </span>
            {order.technical_notes}
          </p>
        )}

        {/* Etapas da confecção (checklist) */}
        <div className="text-sm mb-4">
          <p className="font-semibold mb-1">Etapas da confecção:</p>
          <div className="grid grid-cols-2 gap-1">
            {stages.map((s) => (
              <p key={s.key}>
                [{(order as any)[s.key] ? "X" : " "}] {s.label}
              </p>
            ))}
          </div>
        </div>

        {/* Condições comerciais */}
        <div className="text-xs text-gray-600 border-t border-gray-300 pt-4 space-y-0.5">
          <p className="font-semibold text-black">Condições Comerciais</p>
          <p>{COMPANY.condicoesComerciais.arte}</p>
          <p>{COMPANY.condicoesComerciais.prazoEntrega}</p>
          <p>{COMPANY.condicoesComerciais.formaPagamento}</p>
          <p>{COMPANY.condicoesComerciais.validadeProposta}</p>
        </div>

        <p className="text-[10px] text-gray-400 text-center mt-6">
          {COMPANY.name} — documento gerado pelo sistema
        </p>
      </div>
    </div>
  );
}
