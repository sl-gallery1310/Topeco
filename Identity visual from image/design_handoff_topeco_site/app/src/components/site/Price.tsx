import { eurosHt, eurosTtc } from "@/lib/format";

/** Règle de charte : jamais de HT seul. Toujours HT puis TTC. */
export default function Price({
  ht,
  ttc,
  size = "carte",
  inline = false,
}: {
  ht: number;
  ttc: number;
  size?: "carte" | "grand";
  inline?: boolean;
}) {
  return (
    <p className={"prix" + (size === "grand" ? " prix--grand" : "")} style={inline ? { display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" } : undefined}>
      <span className="prix__ht">{eurosHt(ht)}</span>
      {inline ? " " : <br />}
      <span className="prix__ttc">{eurosTtc(ttc)}</span>
    </p>
  );
}
