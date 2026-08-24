import { createClientRecord } from "../actions";

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-gardin-muted mb-1">{label}</label>
      <input
        type={type}
        name={name}
        required={required}
        className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white outline-none focus:border-gardin-gold transition"
      />
    </div>
  );
}

export default function NovoClientePage({
  searchParams,
}: {
  searchParams: { erro?: string };
}) {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gardin-white mb-6">Novo Cliente</h1>

      {searchParams.erro && (
        <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
          {searchParams.erro}
        </div>
      )}

      <form action={createClientRecord} className="bg-gardin-panel border border-gardin-border rounded-xl p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Nome / Razão Social" name="name" required />
          <Field label="Nome fantasia" name="trade_name" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="CPF ou CNPJ" name="document" />
          <Field label="Telefone" name="phone" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="WhatsApp" name="whatsapp" />
          <Field label="E-mail" name="email" type="email" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Endereço" name="address" />
          <Field label="Cidade" name="city" />
        </div>
        <div>
          <label className="block text-xs text-gardin-muted mb-1">Observações</label>
          <textarea
            name="notes"
            rows={3}
            className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white outline-none focus:border-gardin-gold transition"
          />
        </div>

        <button
          type="submit"
          className="bg-gardin-gold hover:bg-gardin-goldLight text-black font-semibold text-sm px-5 py-2.5 rounded-lg transition"
        >
          Salvar Cliente
        </button>
      </form>
    </div>
  );
}
