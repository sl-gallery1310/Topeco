"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

/**
 * Carte du réseau — Leaflet + tuiles OpenStreetMap.
 *
 * Choix d’une carte libre : pas de clé d’API, pas de compte, licence ODbL avec
 * simple attribution (affichée par Leaflet en bas à droite). Les tuiles viennent
 * d’un tiers : elles ne posent aucun cookie, mais l’adresse IP du visiteur lui est
 * transmise — à garder en tête au regard du bandeau de consentement.
 *
 * Leaflet touche `window` dès son import : il est chargé dynamiquement dans
 * l’effet, jamais au niveau du module, sinon le rendu serveur échoue.
 *
 * La carte complète la liste des revendeurs affichée à côté, qui reste le chemin
 * accessible : même information, en texte.
 */
type R = {
  id: number;
  companyName: string;
  regionLabel: string;
  city: string | null;
  type: "DIRECT" | "PARTNER";
  status: "ACTIVE" | "PROSPECTING" | "AVAILABLE";
  lat: unknown;
  lng: unknown;
};

/** Mêmes couleurs que la légende de la page. */
function couleurs(r: R) {
  if (r.status === "AVAILABLE") return { fill: "#FFFFFF", trait: "#582900" };
  if (r.type === "DIRECT") return { fill: "#2B4A9B", trait: "#2B4A9B" };
  return { fill: "#5F7F2B", trait: "#5F7F2B" };
}

export default function ResellerMap({ resellers }: { resellers: R[] }) {
  const conteneur = useRef<HTMLDivElement>(null);
  const carte = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    let annule = false;

    (async () => {
      const L = (await import("leaflet")).default;
      if (annule || !conteneur.current || carte.current) return;

      const points = resellers
        .map((r) => ({ r, lat: Number(r.lat), lng: Number(r.lng) }))
        .filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lng) && p.lat !== 0);

      const map = L.map(conteneur.current, {
        scrollWheelZoom: false, // la molette doit continuer à faire défiler la page
        attributionControl: true,
      });
      carte.current = map;

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 18,
        attribution:
          '&copy; les contributeurs <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      for (const { r, lat, lng } of points) {
        const c = couleurs(r);
        L.circleMarker([lat, lng], {
          radius: 9,
          color: c.trait,
          weight: 3,
          fillColor: c.fill,
          fillOpacity: 1,
        })
          .addTo(map)
          .bindPopup(
            `<strong>${r.companyName}</strong><br>${r.regionLabel}` +
              (r.city ? `<br>${r.city}` : ""),
          );
      }

      if (points.length) {
        map.fitBounds(
          L.latLngBounds(points.map((p) => [p.lat, p.lng] as [number, number])),
          { padding: [32, 32], maxZoom: 7 },
        );
      } else {
        map.setView([46.6, 2.4], 5); // France métropolitaine
      }
    })();

    return () => {
      annule = true;
      carte.current?.remove();
      carte.current = null;
    };
  }, [resellers]);

  return (
    <figure style={{ margin: "14px 0 0" }}>
      <div
        ref={conteneur}
        className="carte-reseau"
        role="application"
        aria-label="Carte de la couverture du réseau TOPECO en France"
      />
      <figcaption className="sr-only">
        Marqueurs positionnés depuis les coordonnées des revendeurs enregistrés. Fond de
        carte OpenStreetMap. La liste des revendeurs ci-contre donne la même information.
      </figcaption>
    </figure>
  );
}
