import Link from "next/link";
import Image from "next/image";
import type { Block } from "@/lib/blocks";

/** Rend le corps d’un article ou d’une page (blocs JSON édités au back-office). */
export default function Blocks({ blocks }: { blocks: Block[] }) {
  return (
    <div className="article-corps">
      {blocks.map((b, i) => {
        switch (b.type) {
          case "h2": return <h2 key={i}>{b.text}</h2>;
          case "h3": return <h3 key={i}>{b.text}</h3>;
          case "p": return <p key={i}>{b.text}</p>;
          case "list":
            return (
              <ul key={i}>
                {b.items.map((it, j) => <li key={j}>{it}</li>)}
              </ul>
            );
          case "greenCallout":
            return (
              <aside key={i} className="encadre-vert">
                <h3>{b.title}</h3>
                <p style={{ marginTop: 10 }}>{b.text}</p>
                {b.ctaLabel && b.ctaHref && (
                  <Link href={b.ctaHref} className="btn btn--vert" style={{ marginTop: 18 }}>{b.ctaLabel}</Link>
                )}
              </aside>
            );
          case "disclaimer":
            return (
              <aside key={i} className="encadre-brun">
                <p>{b.text}</p>
              </aside>
            );
          case "image":
            return (
              <figure key={i} style={{ margin: 0 }}>
                <Image src={b.url} alt={b.alt} width={820} height={420} style={{ width: "100%", height: "auto" }} />
                {b.caption && <figcaption style={{ marginTop: 8, fontSize: 14, color: "var(--texte-3)" }}>{b.caption}</figcaption>}
              </figure>
            );
        }
      })}
    </div>
  );
}
