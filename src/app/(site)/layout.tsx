import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import CookieBanner from "@/components/site/CookieBanner";
import { getSettings } from "@/lib/settings";

/**
 * Coquille du site public : navigation, pied de page et bandeau cookies.
 * Le groupe (site) ne change aucune URL — il sert seulement à réserver cette
 * coquille aux pages publiques, /admin ayant la sienne.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <a href="#contenu" className="sr-only">Aller au contenu</a>
      <Header />
      <main id="contenu">{children}</main>
      <Footer notice={settings["demo.notice"]} vatNotice={settings["legal.vatNotice"]} />
      <CookieBanner policyVersion={settings["cookies.policyVersion"] ?? "2026-01"} />
    </>
  );
}
