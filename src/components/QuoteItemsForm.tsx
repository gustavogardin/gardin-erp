"use client";

import { useState } from "react";

type Item = {
  name: string;
  measurements: string;
  quantity: number;
  technical_description: string;
  unit_value: number;
  needs_art: boolean;
  needs_printing: boolean;
  needs_production: boolean;
  needs_installation: boolean;
  art_already_approved: boolean;
};

const emptyItem: Item = {
  name: "",
  measurements: "",
  quantity: 1,
  technical_description: "",
  unit_value: 0,
  needs_art: false,
  needs_printing: false,
  needs_production: false,
  needs_installation: false,
  art_already_approved: false,
};

export default function QuoteItemsForm({ canViewFinancials = true }: { canViewFinancials?: boolean }) {
  const [items, setItems] = useState<Item[]>([{ ...emptyItem }]);

  const update = (index: number, patch: Partial<Item>) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, ...patch } : it)));
  };

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);
  const removeItem = (index: number) => setItems((prev) => prev.filter((_, i) => i !== index));

  const total = items.reduce((sum, it) => sum + (Number(it.unit_value) || 0) * (Number(it.quantity) || 0), 0);
  const currency = (n: number) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="space-y-4">
      <input type="hidden" name="items_json" value={JSON.stringify(items)} />

      {items.map((item, index) => (
        <div key={index} className="bg-black/30 border border-gardin-border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gardin-muted">Item {index + 1}</p>
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="text-xs text-red-400 hover:text-red-300"
              >
                Remover
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gardin-muted mb-1">Nome do item *</label>
              <input
                value={item.name}
                onChange={(e) => update(index, { name: e.target.value })}
                placeholder="Ex: Placas institucionais"
                className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
              />
            </div>
            <div>
              <label className="block text-xs text-gardin-muted mb-1">Medidas</label>
              <input
                value={item.measurements}
                onChange={(e) => update(index, { measurements: e.target.value })}
                placeholder="Ex: 1,30 x 0,60 m"
                className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-gardin-muted mb-1">
              Descritivo técnico (uma característica por linha)
            </label>
            <textarea
              value={item.technical_description}
              onChange={(e) => update(index, { technical_description: e.target.value })}
              rows={4}
              placeholder={"Estrutura metálica interna...\nRevestimento em ACM aço escovado...\nImpressão UV frente e verso..."}
              className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-gardin-muted mb-1">Quantidade</label>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) => update(index, { quantity: Number(e.target.value) })}
                className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
              />
            </div>
            {canViewFinancials && (
              <div className="col-span-2">
                <label className="block text-xs text-gardin-muted mb-1">Valor unitário (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={item.unit_value}
                  onChange={(e) => update(index, { unit_value: Number(e.target.value) })}
                  className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white"
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs text-gardin-muted mb-2">Este item passa por:</label>
            <div className="grid grid-cols-2 gap-2">
              <label className="flex items-center gap-2 text-sm text-gardin-white">
                <input
                  type="checkbox"
                  checked={item.needs_art}
                  onChange={(e) => update(index, { needs_art: e.target.checked })}
                  className="accent-gardin-gold"
                />
                Criação de arte
              </label>
              <label className="flex items-center gap-2 text-sm text-gardin-white">
                <input
                  type="checkbox"
                  checked={item.needs_printing}
                  onChange={(e) => update(index, { needs_printing: e.target.checked })}
                  className="accent-gardin-gold"
                />
                Impressão
              </label>
              <label className="flex items-center gap-2 text-sm text-gardin-white">
                <input
                  type="checkbox"
                  checked={item.needs_production}
                  onChange={(e) => update(index, { needs_production: e.target.checked })}
                  className="accent-gardin-gold"
                />
                Produção
              </label>
              <label className="flex items-center gap-2 text-sm text-gardin-white">
                <input
                  type="checkbox"
                  checked={item.needs_installation}
                  onChange={(e) => update(index, { needs_installation: e.target.checked })}
                  className="accent-gardin-gold"
                />
                Instalação
              </label>
            </div>
            {item.needs_art && (
              <label className="flex items-center gap-2 text-sm text-gardin-gold mt-2">
                <input
                  type="checkbox"
                  checked={item.art_already_approved}
                  onChange={(e) => update(index, { art_already_approved: e.target.checked })}
                  className="accent-gardin-gold"
                />
                Arte já aprovada (pula direto para impressão)
              </label>
            )}
          </div>

          {canViewFinancials && (
            <p className="text-right text-sm text-gardin-muted">
              Subtotal: <span className="text-gardin-white font-medium">{currency(item.unit_value * item.quantity)}</span>
            </p>
          )}
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="text-sm bg-black/30 border border-gardin-border rounded-lg px-4 py-2 text-gardin-white hover:border-gardin-gold transition"
      >
        + Adicionar item
      </button>

      {canViewFinancials && (
        <div className="text-right border-t border-gardin-border pt-3">
          <span className="text-sm text-gardin-muted mr-2">Total do orçamento:</span>
          <span className="text-xl font-bold text-gardin-gold">{currency(total)}</span>
        </div>
      )}
    </div>
  );
}
