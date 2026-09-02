/**
 * Carte du réseau.
 *
 * Le prototype fournit `design/carte-revendeurs.html` : un SVG France dessiné depuis
 * la géométrie Natural Earth, avec 8 marqueurs. Deux options d’intégration :
 *
 * 1. (retenue ici) copier les tracés dans un composant SVG inline — `public/france.svg`
 *    en <img> ne permet pas de rendre les marqueurs focusables ;
 * 2. une bibliothèque de cartes (MapLibre) alimentée par lat/lng des revendeurs.
 *
 * Les marqueurs sont générés depuis la base : couleur selon type/status,
 * chacun focusable et étiqueté (exigence d’accessibilité).
 * Ne pas mettre `loading="lazy"` sur un éventuel iframe : cela empêchait le rendu du SVG.
 */
type R = {
  id: number;
  companyName: string;
  regionLabel: string;
  type: "DIRECT" | "PARTNER";
  status: "ACTIVE" | "PROSPECTING" | "AVAILABLE";
  lat: unknown;
  lng: unknown;
};

/** Projection très simple (équirectangulaire) suffisante à l’échelle de la France métropolitaine. */
function project(lat: number, lng: number, w: number, h: number) {
  const [minLng, maxLng, minLat, maxLat] = [-5.2, 9.6, 41.3, 51.1];
  return {
    x: ((lng - minLng) / (maxLng - minLng)) * w,
    y: h - ((lat - minLat) / (maxLat - minLat)) * h,
  };
}

const COLOR = (r: R) =>
  r.status === "AVAILABLE" ? "#FFFFFF" : r.type === "DIRECT" ? "#2B4A9B" : "#5F7F2B";

export default function ResellerMap({ resellers }: { resellers: R[] }) {
  const w = 460, h = 470;
  return (
    <figure style={{ margin: "14px 0 0", maxWidth: 300, aspectRatio: "46 / 47" }}>
      <svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Carte de la couverture du réseau TOPECO en France" style={{ width: "100%", height: "auto" }}>
        {/* Remplacer ce rectangle par les tracés de design/carte-revendeurs.html */}
        <use href="/france.svg#hexagone" />
        <rect x="0" y="0" width={w} height={h} fill="#E7E7DA" stroke="#D9D9C4" />
        {resellers.map((r) => {
          const lat = Number(r.lat), lng = Number(r.lng);
          if (!lat || !lng) return null;
          const { x, y } = project(lat, lng, w, h);
          return (
            <g key={r.id} tabIndex={0} role="img" aria-label={`${r.companyName} — ${r.regionLabel}`}>
              <circle cx={x} cy={y} r={9} fill={COLOR(r)} stroke={r.status === "AVAILABLE" ? "#582900" : "none"} strokeWidth={3} />
              <title>{r.companyName} — {r.regionLabel}</title>
            </g>
          );
        })}
      </svg>
      <figcaption className="sr-only">
        Marqueurs positionnés depuis les coordonnées des revendeurs enregistrés. Géométrie Natural Earth.
      </figcaption>
    </figure>
  );
}
