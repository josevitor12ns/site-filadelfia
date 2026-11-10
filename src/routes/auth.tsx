import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/site/Layout";

export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Acesso restrito — Igreja Filadélfia" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) nav({ to: "/admin", replace: true });
    });
  }, [nav]);


  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setBusy(false);
      if (error) { toast.error("E-mail ou senha inválidos."); return; }
      nav({ to: "/admin" });
    } else {
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      setBusy(false);
      if (error) { toast.error(error.message); return; }
      toast.success("Conta criada. Confirme pelo link enviado ao seu e-mail.");
      setMode("in");
    }
  }

  const input = "w-full border border-input bg-card px-4 py-3 outline-none focus:border-gold";
  return (
    <div className="flex min-h-screen items-center justify-center bg-sand px-5">
      <form onSubmit={submit} className="w-full max-w-sm bg-background p-8 shadow-soft">
        <Logo className="h-14" />
        <h1 className="mt-6 text-3xl">Painel administrativo</h1>
        <p className="mt-2 text-sm text-muted-foreground">Acesso restrito à liderança da igreja.</p>
        <div className="mt-8 space-y-4">
          <label className="block text-sm">E-mail<input className={input} type="email" required placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" /></label>
          <label className="block text-sm">Senha<input className={input} type="password" required minLength={8} placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === "in" ? "current-password" : "new-password"} /></label>
          <Button disabled={busy} className="w-full bg-primary py-3 text-sm text-primary-foreground transition hover:bg-gold hover:text-ink disabled:opacity-50">{mode === "in" ? "Entrar" : "Criar conta"}</Button>
        </div>
        <Button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="mt-6 text-sm text-muted-foreground hover:text-gold">
          {mode === "in" ? "Primeiro acesso? Criar conta" : "Já tenho conta"}
        </Button>
        <p className="mt-6 border-t border-border pt-6 text-sm">
          <Link to="/" className="text-muted-foreground hover:text-gold">← Voltar ao site</Link>
        </p>
      </form>
    </div>
  );
}
