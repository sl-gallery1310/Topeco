"use client";
import { useState } from "react";
import Image from "next/image";
import ImagePlaceholder from "@/components/site/ImagePlaceholder";

/** Galerie : vignette cliquable au clic et au clavier (bouton natif). */
export default function Gallery({ images }: { images: { id: number; url: string; alt: string }[] }) {
  const [active, setActive] = useState(0);
  if (images.length === 0) return <ImagePlaceholder height={300} label="PHOTOGRAPHIE PRODUIT À VENIR" markSize={56} />;

  return (
    <div>
      <Image src={images[active].url} alt={images[active].alt} width={640} height={480}
        style={{ width: "100%", height: "auto", minHeight: 300, objectFit: "cover", border: "1px solid var(--bordure)" }} priority />
      {images.length > 1 && (
        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          {images.map((img, i) => (
            <button key={img.id} type="button" onClick={() => setActive(i)}
              aria-label={"Afficher l’image " + (i + 1)} aria-pressed={i === active}
              style={{ padding: 0, border: i === active ? "2px solid var(--bleu)" : "1px solid var(--bordure)", background: "none", cursor: "pointer" }}>
              <Image src={img.url} alt="" width={84} height={64} style={{ width: 84, height: 64, objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
