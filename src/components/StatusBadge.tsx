const COLOR_MAP: Record<string, string> = {
  // etapas
  nao_iniciado: "bg-gray-500/20 text-gray-300 border-gray-500/40",
  aguardando: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  em_andamento: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  concluido: "bg-green-500/20 text-green-300 border-green-500/40",
  atrasado: "bg-red-500/20 text-red-300 border-red-500/40",
  dependencia: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  // financeiro
  nao_cobrado: "bg-gray-500/20 text-gray-300 border-gray-500/40",
  a_cobrar: "bg-yellow-500/20 text-yellow-300 border-yellow-500/40",
  cobranca_enviada: "bg-blue-500/20 text-blue-300 border-blue-500/40",
  parcialmente_pago: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  pago: "bg-green-500/20 text-green-300 border-green-500/40",
  vencido: "bg-red-500/20 text-red-300 border-red-500/40",
  // prioridade
  normal: "bg-gray-500/20 text-gray-300 border-gray-500/40",
  alta: "bg-orange-500/20 text-orange-300 border-orange-500/40",
  urgente: "bg-red-500/20 text-red-300 border-red-500/40",
};

const LABEL_MAP: Record<string, string> = {
  nao_iniciado: "Não iniciado",
  aguardando: "Aguardando",
  em_andamento: "Em andamento",
  concluido: "Concluído",
  atrasado: "Atrasado",
  dependencia: "Dependência",
  nao_cobrado: "Não cobrado",
  a_cobrar: "A cobrar",
  cobranca_enviada: "Cobrança enviada",
  parcialmente_pago: "Parcialmente pago",
  pago: "Pago",
  vencido: "Vencido",
  normal: "Normal",
  alta: "Alta",
  urgente: "Urgente",
  entrada: "Entrada",
  arte: "Arte",
  aprovacao: "Aprovação",
  impressao: "Impressão",
  producao: "Produção",
  instalacao: "Instalação",
  financeiro: "Financeiro",
};

export default function StatusBadge({ status }: { status: string }) {
  const color = COLOR_MAP[status] ?? "bg-gray-500/20 text-gray-300 border-gray-500/40";
  const label = LABEL_MAP[status] ?? status;
  return (
    <span className={`inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full border ${color}`}>
      {label}
    </span>
  );
}
