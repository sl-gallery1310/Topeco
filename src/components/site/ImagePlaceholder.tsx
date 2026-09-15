import Image from "next/image";

/**
 * État vide des visuels manquants — repris du prototype :
 * fond crème, bordure, marque centrée, libellé « PHOTO PRODUIT À VENIR ».
 * La marque tient lieu de visuel : son texte alternatif annonce un visuel provisoire.
 * Le libellé visible, qui dit la même chose, est masqué aux lecteurs d’écran pour
 * ne pas être lu deux fois.
 */
export default function ImagePlaceholder({
  label = "PHOTO PRODUIT À VENIR",
  alt,
  height = 150,
  markSize = 44,
}: {
  label?: string;
  /** À préciser quand on sait ce que l’image représentera (produit, catégorie). */
  alt?: string;
  height?: number | string;
  markSize?: number;
}) {
  return (
    <div className="placeholder-image" style={{ height, minHeight: typeof height === "number" ? height : undefined }}>
      <Image src="/mark.svg" alt={alt ?? `Visuel provisoire : ${label.toLocaleLowerCase("fr-FR")}`} width={markSize} height={markSize} />
      <span aria-hidden="true">{label}</span>
    </div>
  );
}
