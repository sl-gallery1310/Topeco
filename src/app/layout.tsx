import type { Metadata } from "next";
import { Montserrat, Open_Sans } from "next/font/google";
import "./globals.css";

const montserrat = Montserrat({ subsets: ["latin"], weight: ["500", "600", "700"], display: "swap", variable: "--font-titre" });
const openSans = Open_Sans({ subsets: ["latin"], weight: ["400", "600", "700"], display: "swap", variable: "--font-corps" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "TOPECO — emballages alimentaires recyclables pour les professionnels", template: "%s — TOPECO" },
  description:
    "Emballages, consommables, hygiène et pailles inox pour restaurants, boulangeries et traiteurs. Conseil réglementaire loi AGEC inclus, livraison 48 h en Île-de-France.",
  openGraph: { type: "website", locale: "fr_FR", siteName: "TOPECO" },
};

/**
 * Coquille du document, rien de plus : polices, langue, feuille de charte.
 * L’en-tête, le pied de page et le bandeau cookies appartiennent au site public
 * et vivent dans src/app/(site)/layout.tsx — le back-office a sa propre coquille
 * et ne doit pas afficher la navigation publique.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={montserrat.variable + " " + openSans.variable}>
      <body>{children}</body>
    </html>
  );
}
