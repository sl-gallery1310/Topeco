import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import CookieBanner from "@/components/site/CookieBanner";
import { getSettings } from "@/lib/settings";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap", variable: "--font-titre" });
const openSans = Open_Sans({ subsets: ["latin"], weight: ["400", "600", "700"], display: "swap", variable: "--font-corps" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "TOPECO — emballages alimentaires recyclables pour les professionnels", template: "%s — TOPECO" },
  description:
    "Emballages, consommables, hygiène et pailles inox pour restaurants, boulangeries et traiteurs. Conseil réglementaire loi AGEC inclus, livraison 48 h en Île-de-France.",
  openGraph: { type: "website", locale: "fr_FR", siteName: "TOPECO" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <html lang="fr" className={montserrat.variable + " " + openSans.variable}>
      <body>
        <a href="#contenu" className="sr-only">Aller au contenu</a>
        <Header />
        <main id="contenu">{children}</main>
        <Footer notice={settings["demo.notice"]} vatNotice={settings["legal.vatNotice"]} />
        <CookieBanner policyVersion={settings["cookies.policyVersion"] ?? "2026-01"} />
      </body>
    </html>
  );
}
