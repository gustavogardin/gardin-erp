// Dados da Gardin usados na impressão/PDF da OS e Orçamento.
// Edite aqui quando precisar atualizar algo (CNPJ, banco, etc.)
export const COMPANY = {
  name: "Gardin Comunicação Visual",
  phone: "(55) 99657-8799",
  whatsapp: "55996578799",
  cnpj: "", // preencha se quiser exibir no PDF
  address: "", // preencha se quiser exibir no PDF
  bank: {
    nomeFantasia: "Gardin Comunicação Visual",
    razaoSocial: "",
    banco: "",
    agencia: "",
    contaCorrente: "",
    pix: "",
  },
  condicoesComerciais: {
    arte: "Arte: a ser enviada/aprovada pelo cliente em formato PDF.",
    prazoEntrega: "Prazo de entrega: a combinar.",
    formaPagamento: "Forma de pagamento: transferência bancária ou PIX.",
    validadeProposta: "Validade da proposta: 20 dias úteis.",
  },
};
