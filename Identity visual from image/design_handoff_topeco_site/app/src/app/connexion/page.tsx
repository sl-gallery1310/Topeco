import type { Metadata } from "next";
import Breadcrumbs from "@/components/site/Breadcrumbs";
import LoginForm from "@/components/site/LoginForm";

export const metadata: Metadata = { title: "Connexion à votre espace client", robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; erreur?: string }> }) {
  const { next, erreur } = await searchParams;
  return (
    <>
      <Breadcrumbs items={[{ label: "Connexion" }]} />
      <div className="colonne-texte" style={{ paddingTop: "clamp(28px,3vw,44px)", paddingBottom: "var(--section-y)", maxWidth: 480 }}>
        <h1>Connexion</h1>
        <p style={{ marginTop: 12, color: "var(--texte-2)" }}>
          Espace réservé aux comptes professionnels. Vos tarifs contractuels s’appliquent dès la connexion.
        </p>
        {erreur === "compte-non-rattache" && (
          <p className="erreur" style={{ marginTop: 14 }}>Votre identifiant n’est rattaché à aucun compte professionnel. Contactez votre commercial.</p>
        )}
        <LoginForm next={next} />
      </div>
    </>
  );
}
