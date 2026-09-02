"use client";
import { useActionState } from "react";
import Link from "next/link";
import { loginAction, type LoginState } from "@/server/actions/auth";

export default function LoginForm({ next, admin = false }: { next?: string; admin?: boolean }) {
  const [state, action, pending] = useActionState(loginAction, {} as LoginState);
  const err = (k: string) => state.errors?.[k]?.[0];

  return (
    <form action={action} className="panneau" style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 16 }} noValidate>
      <input type="hidden" name="next" value={next ?? (admin ? "/admin" : "/mon-compte")} />
      {err("_form") && <p className="erreur" role="alert">{err("_form")}</p>}

      <div className={"champ" + (err("email") ? " champ--erreur" : "")}>
        <label htmlFor="email">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required />
        {err("email") && <p className="erreur">{err("email")}</p>}
      </div>

      <div className={"champ" + (err("password") ? " champ--erreur" : "")}>
        <label htmlFor="password">Mot de passe</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required />
        {err("password") && <p className="erreur">{err("password")}</p>}
      </div>

      <button type="submit" className="btn btn--bleu" disabled={pending}>{pending ? "Connexion…" : "Se connecter"}</button>

      {!admin && (
        <p style={{ fontSize: 14.5 }}>
          <Link href="/mot-de-passe-oublie">Mot de passe oublié ?</Link>
        </p>
      )}
    </form>
  );
}
