"use client";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

const OPTIONS = [
  ["pertinence", "Pertinence"],
  ["prix-croissant", "Prix croissant"],
  ["prix-decroissant", "Prix décroissant"],
];

/**
 * Le tri part dans l’URL comme les filtres (?tri=…), en conservant les
 * paramètres déjà posés : changer l’ordre ne doit pas vider les filtres.
 * Sans JavaScript, le bouton « Trier » du <noscript> soumet le formulaire.
 */
export default function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const path = usePathname();
  const params = useSearchParams();

  return (
    <select
      id="tri"
      name="tri"
      value={value}
      style={{ minWidth: 190 }}
      onChange={(e) => {
        const next = new URLSearchParams(params.toString());
        next.set("tri", e.target.value);
        router.push(path + "?" + next.toString(), { scroll: false });
      }}
    >
      {OPTIONS.map(([v, label]) => (
        <option key={v} value={v}>{label}</option>
      ))}
    </select>
  );
}
