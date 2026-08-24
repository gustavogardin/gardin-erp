"use client";

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="print:hidden bg-gardin-gold hover:bg-gardin-goldLight text-black font-semibold text-sm px-4 py-2 rounded-lg transition"
    >
      🖨️ Baixar / Imprimir PDF
    </button>
  );
}
