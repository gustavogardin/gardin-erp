import Image from "next/image";
import { signIn } from "./actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { erro?: string };
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gardin-black px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image src="/logo.png" alt="Gardin Comunicação Visual" width={160} height={160} priority />
        </div>

        <div className="bg-gardin-panel border border-gardin-border rounded-2xl p-8 shadow-xl">
          <h1 className="text-xl font-bold text-center text-gardin-white mb-1">
            Acessar o sistema
          </h1>
          <p className="text-sm text-gardin-muted text-center mb-6">
            Gardin Comunicação Visual
          </p>

          {searchParams.erro && (
            <div className="mb-4 text-sm text-red-400 bg-red-950/40 border border-red-900 rounded-lg px-3 py-2">
              {searchParams.erro}
            </div>
          )}

          <form action={signIn} className="space-y-4">
            <div>
              <label className="block text-xs text-gardin-muted mb-1">E-mail</label>
              <input
                type="email"
                name="email"
                required
                className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white outline-none focus:border-gardin-gold transition"
                placeholder="voce@gardin.com.br"
              />
            </div>
            <div>
              <label className="block text-xs text-gardin-muted mb-1">Senha</label>
              <input
                type="password"
                name="password"
                required
                className="w-full bg-black/40 border border-gardin-border rounded-lg px-3 py-2 text-sm text-gardin-white outline-none focus:border-gardin-gold transition"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gardin-gold hover:bg-gardin-goldLight text-black font-semibold rounded-lg py-2.5 text-sm transition"
            >
              Entrar
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-gardin-muted mt-6">
          Acesso restrito a colaboradores da Gardin Comunicação Visual
        </p>
      </div>
    </div>
  );
}
