import type { Metadata } from "next";
import LoginForm from "@/components/site/LoginForm";

export const metadata: Metadata = { title: "Back-office — connexion", robots: { index: false } };

export default function AdminLogin() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", background: "var(--bleu)", padding: 24 }}>
      <div style={{ width: "min(440px, 100%)" }}>
        <p className="marque__mot" style={{ color: "var(--blanc)", textAlign: "center" }}>TOP<em>ECO</em></p>
        <h1 style={{ color: "var(--blanc)", textAlign: "center", marginTop: 10, fontSize: 24 }}>Back-office</h1>
        <LoginForm admin next="/admin" />
      </div>
    </div>
  );
}
