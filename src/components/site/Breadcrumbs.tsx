import Link from "next/link";

export type Crumb = { href?: string; label: string };

/** Fil d’Ariane, piloté par la route (jamais codé en dur dans la page). */
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav className="ariane" aria-label="Fil d’Ariane">
      <div className="conteneur">
        <ol>
          <li><Link href="/">Accueil</Link></li>
          {items.map((c, i) => (
            <li key={c.label} aria-current={i === items.length - 1 ? "page" : undefined}>
              {c.href && i !== items.length - 1 ? <Link href={c.href}>{c.label}</Link> : c.label}
            </li>
          ))}
        </ol>
      </div>
    </nav>
  );
}
