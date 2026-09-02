"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/boutique/emballages", label: "Boutique" },
  { href: "/nos-engagements", label: "Nos engagements" },
  { href: "/nos-revendeurs", label: "Nos revendeurs" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  return (
    <header className="entete sur-bleu">
      <div className="conteneur entete__barre">
        <Link href="/" className="marque" aria-label="TOPECO — accueil">
          <Image src="/mark-white.svg" alt="" width={34} height={34} priority />
          <span className="marque__mot">TOP<em>ECO</em></span>
        </Link>

        <nav className="nav-principale" aria-label="Navigation principale" style={{ display: "none" }} data-desktop-nav>
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} aria-current={path.startsWith(n.href) ? "page" : undefined}>
              {n.label}
            </Link>
          ))}
          <Link href="/contact" className="btn btn--vert" style={{ padding: "14px 20px" }}>Devis gratuit</Link>
        </nav>

        <div style={{ display: "flex", gap: 10, alignItems: "center" }} data-mobile-nav>
          <Link href="/contact" className="btn btn--vert" style={{ padding: "13px 14px", fontSize: 13 }}>Devis</Link>
          <button
            type="button"
            className="burger"
            aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-mobile" className="menu-mobile" aria-label="Menu">
          <div className="conteneur">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} onClick={() => setOpen(false)}>{n.label}</Link>
            ))}
            <Link href="/mon-compte" onClick={() => setOpen(false)}>Mon compte</Link>
          </div>
        </nav>
      )}

      {/* La bascule desktop/mobile se fait en CSS (pas de JS de détection) */}
      <style>{`
        @media (min-width: 1000px) {
          [data-desktop-nav] { display: flex !important; }
          [data-mobile-nav] { display: none !important; }
        }
      `}</style>
    </header>
  );
}
