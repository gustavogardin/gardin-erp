import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/app/login/actions";

const mainLinks = [
  { href: "/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/ordens", label: "Ordens de Serviço", icon: "🧾" },
  { href: "/clientes", label: "Clientes", icon: "👥" },
];

const stageLinks = [
  { href: "/arte", label: "Arte", icon: "🎨" },
  { href: "/impressao", label: "Impressão", icon: "🖨️" },
  { href: "/producao", label: "Produção", icon: "🛠️" },
  { href: "/instalacao", label: "Instalação", icon: "🚚" },
];

export default function Sidebar({ userName }: { userName: string }) {
  return (
    <aside className="w-60 shrink-0 bg-gardin-panel border-r border-gardin-border h-screen sticky top-0 flex flex-col print:hidden">
      <div className="flex flex-col items-center py-6 border-b border-gardin-border">
        <Image src="/logo.png" alt="Gardin" width={64} height={64} />
        <span className="text-xs text-gardin-muted mt-2 text-center px-2">
          Comunicação Visual
        </span>
      </div>

      <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
        {mainLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gardin-white hover:bg-black/40 hover:text-gardin-gold transition"
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}

        <p className="px-3 pt-4 pb-1 text-[10px] uppercase tracking-wide text-gardin-muted">
          Processos
        </p>
        {stageLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gardin-white hover:bg-black/40 hover:text-gardin-gold transition"
          >
            <span>{link.icon}</span>
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gardin-border">
        <p className="text-xs text-gardin-muted px-2 mb-2 truncate">{userName}</p>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-gardin-muted hover:bg-black/40 hover:text-red-400 transition"
          >
            Sair
          </button>
        </form>
      </div>
    </aside>
  );
}
