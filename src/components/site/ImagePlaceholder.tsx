import Image from "next/image";

/**
 * État vide des visuels manquants — repris du prototype :
 * fond crème, bordure, marque centrée, libellé « PHOTO PRODUIT À VENIR ».
 */
export default function ImagePlaceholder({
  label = "PHOTO PRODUIT À VENIR",
  height = 150,
  markSize = 44,
}: {
  label?: string;
  height?: number | string;
  markSize?: number;
}) {
  return (
    <div className="placeholder-image" style={{ height, minHeight: typeof height === "number" ? height : undefined }}>
      <Image src="/mark.svg" alt="" width={markSize} height={markSize} />
      <span>{label}</span>
    </div>
  );
}
