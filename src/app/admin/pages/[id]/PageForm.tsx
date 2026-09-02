"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { savePage, type AdminState } from "@/server/actions/admin";
import { BLOCK_LABELS, type Block } from "@/lib/blocks";

type P = {
  id: number;
  slug: string;
  title: string;
  introHtml: string;
  seoTitle: string;
  seoDescription: string;
  published: boolean;
  bodyBlocks: Block[];
};

/** Bloc vide selon le type choisi — évite les champs absents à l’enregistrement. */
function blocVide(type: Block["type"]): Block {
  switch (type) {
    case "list": return { type: "list", items: [""] };
    case "greenCallout": return { type: "greenCallout", title: "", text: "" };
    case "image": return { type: "image", url: "", alt: "" };
    case "disclaimer": return { type: "disclaimer", text: "" };
    case "h2": return { type: "h2", text: "" };
    case "h3": return { type: "h3", text: "" };
    default: return { type: "p", text: "" };
  }
}

export default function PageForm({ page, slugPrefill }: { page: P | null; slugPrefill?: string }) {
  const [state, action, pending] = useActionState(savePage, {} as AdminState);
  const [blocks, setBlocks] = useState<Block[]>(page?.bodyBlocks ?? []);
  const err = (k: string) => state.errors?.[k]?.[0];

  const maj = (i: number, patch: Record<string, unknown>) =>
    setBlocks((bs) => bs.map((b, j) => (j === i ? ({ ...b, ...patch } as Block) : b)));

  const deplacer = (i: number, delta: number) =>
    setBlocks((bs) => {
      const j = i + delta;
      if (j < 0 || j >= bs.length) return bs;
      const copie = [...bs];
      [copie[i], copie[j]] = [copie[j], copie[i]];
      return copie;
    });

  return (
    <form action={action} className="panneau" noValidate>
      {page && <input type="hidden" name="id" value={page.id} />}
      {/* Le corps voyage en JSON : l’éditeur ci-dessous en est la seule source. */}
      <input type="hidden" name="bodyBlocks" value={JSON.stringify(blocks)} />

      {err("_form") && <p className="erreur" role="alert" style={{ marginBottom: 14 }}>{err("_form")}</p>}

      <fieldset>
        <legend>Identité</legend>
        <div className="admin__grille-champs" style={{ marginTop: 12 }}>
          <div className={"champ" + (err("title") ? " champ--erreur" : "")}>
            <label htmlFor="title">Titre *</label>
            <input id="title" name="title" defaultValue={page?.title} placeholder="Nos engagements" required />
            {err("title") && <p className="erreur">{err("title")}</p>}
          </div>
          <div className={"champ" + (err("slug") ? " champ--erreur" : "")}>
            <label htmlFor="slug">Adresse (URL) *</label>
            <input id="slug" name="slug" defaultValue={page?.slug ?? slugPrefill} placeholder="nos-engagements" required />
            {err("slug")
              ? <p className="erreur">{err("slug")}</p>
              : <p style={{ fontSize: 13.5, color: "var(--texte-3)" }}>Servie sur /{page?.slug ?? slugPrefill ?? "adresse"}</p>}
          </div>
        </div>

        <div className="champ" style={{ marginTop: 16 }}>
          <label htmlFor="introHtml">Chapô (HTML simple, facultatif)</label>
          <textarea id="introHtml" name="introHtml" defaultValue={page?.introHtml} placeholder="<p>Une phrase d’introduction.</p>" />
        </div>
      </fieldset>

      <fieldset style={{ marginTop: 26, borderTop: "1px solid var(--bordure)", paddingTop: 20 }}>
        <legend>Corps de la page</legend>
        {err("bodyBlocks") && <p className="erreur" style={{ marginTop: 10 }}>{err("bodyBlocks")}</p>}

        {blocks.length === 0 && (
          <p style={{ marginTop: 12, color: "var(--texte-3)" }}>
            Aucun bloc pour l’instant. Ajoutez-en un ci-dessous.
          </p>
        )}

        {blocks.map((b, i) => (
          <div key={i} style={{ marginTop: 16, border: "1px solid var(--bordure)", padding: 14, background: "var(--creme)" }}>
            <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <strong style={{ font: "600 13px/1.4 var(--titre)", letterSpacing: "0.08em", textTransform: "uppercase", color: "var(--brun)" }}>
                {BLOCK_LABELS[b.type]}
              </strong>
              <span style={{ marginLeft: "auto", display: "flex", gap: 10 }}>
                <button type="button" className="bouton-texte" style={{ fontSize: 13.5 }} onClick={() => deplacer(i, -1)} disabled={i === 0} aria-label="Monter le bloc">↑</button>
                <button type="button" className="bouton-texte" style={{ fontSize: 13.5 }} onClick={() => deplacer(i, 1)} disabled={i === blocks.length - 1} aria-label="Descendre le bloc">↓</button>
                <button type="button" className="bouton-texte" style={{ fontSize: 13.5, borderColor: "var(--brun)", color: "var(--brun)" }} onClick={() => setBlocks((bs) => bs.filter((_, j) => j !== i))}>Supprimer</button>
              </span>
            </div>

            {(b.type === "p" || b.type === "h2" || b.type === "h3" || b.type === "disclaimer") && (
              <div className="champ" style={{ marginTop: 12 }}>
                <label htmlFor={"b" + i + "-text"}>Texte</label>
                <textarea id={"b" + i + "-text"} value={b.text} onChange={(e) => maj(i, { text: e.target.value })} style={{ minHeight: b.type === "p" ? 110 : 60 }} />
              </div>
            )}

            {b.type === "list" && (
              <div style={{ marginTop: 12 }}>
                {b.items.map((item, k) => (
                  <div className="champ" key={k} style={{ marginTop: 8 }}>
                    <label className="sr-only" htmlFor={"b" + i + "-i" + k}>Élément {k + 1}</label>
                    <input
                      id={"b" + i + "-i" + k}
                      value={item}
                      onChange={(e) => maj(i, { items: b.items.map((v, m) => (m === k ? e.target.value : v)) })}
                    />
                  </div>
                ))}
                <button type="button" className="bouton-texte" style={{ marginTop: 10, fontSize: 13.5 }} onClick={() => maj(i, { items: [...b.items, ""] })}>
                  Ajouter un élément
                </button>
              </div>
            )}

            {b.type === "greenCallout" && (
              <div className="admin__grille-champs" style={{ marginTop: 12 }}>
                <div className="champ">
                  <label htmlFor={"b" + i + "-t"}>Titre de l’encadré</label>
                  <input id={"b" + i + "-t"} value={b.title} onChange={(e) => maj(i, { title: e.target.value })} />
                </div>
                <div className="champ">
                  <label htmlFor={"b" + i + "-x"}>Texte</label>
                  <textarea id={"b" + i + "-x"} value={b.text} onChange={(e) => maj(i, { text: e.target.value })} />
                </div>
                <div className="champ">
                  <label htmlFor={"b" + i + "-cl"}>Libellé du lien (facultatif)</label>
                  <input id={"b" + i + "-cl"} value={b.ctaLabel ?? ""} onChange={(e) => maj(i, { ctaLabel: e.target.value })} />
                </div>
                <div className="champ">
                  <label htmlFor={"b" + i + "-ch"}>Adresse du lien (facultatif)</label>
                  <input id={"b" + i + "-ch"} value={b.ctaHref ?? ""} onChange={(e) => maj(i, { ctaHref: e.target.value })} />
                </div>
              </div>
            )}

            {b.type === "image" && (
              <div className="admin__grille-champs" style={{ marginTop: 12 }}>
                <div className="champ">
                  <label htmlFor={"b" + i + "-u"}>Adresse de l’image</label>
                  <input id={"b" + i + "-u"} value={b.url} onChange={(e) => maj(i, { url: e.target.value })} placeholder="/uploads/photo.png" />
                </div>
                <div className="champ">
                  <label htmlFor={"b" + i + "-a"}>Texte alternatif</label>
                  <input id={"b" + i + "-a"} value={b.alt} onChange={(e) => maj(i, { alt: e.target.value })} />
                </div>
                <div className="champ">
                  <label htmlFor={"b" + i + "-c"}>Légende (facultatif)</label>
                  <input id={"b" + i + "-c"} value={b.caption ?? ""} onChange={(e) => maj(i, { caption: e.target.value })} />
                </div>
              </div>
            )}
          </div>
        ))}

        <div className="champ" style={{ marginTop: 18, maxWidth: 320 }}>
          <label htmlFor="nouveau-bloc">Ajouter un bloc</label>
          <select
            id="nouveau-bloc"
            value=""
            onChange={(e) => {
              // Le type est lu tout de suite : la fonction passée à setBlocks
              // s'exécute au rendu suivant, quand le select a déjà été remis à vide.
              const type = e.target.value as Block["type"];
              if (!type) return;
              setBlocks((bs) => [...bs, blocVide(type)]);
              e.target.value = "";
            }}
          >
            <option value="">Choisir un type…</option>
            {(Object.keys(BLOCK_LABELS) as Block["type"][]).map((t) => (
              <option key={t} value={t}>{BLOCK_LABELS[t]}</option>
            ))}
          </select>
        </div>
      </fieldset>

      <fieldset style={{ marginTop: 26, borderTop: "1px solid var(--bordure)", paddingTop: 20 }}>
        <legend>Référencement et publication</legend>
        <div className="admin__grille-champs" style={{ marginTop: 12 }}>
          <div className="champ">
            <label htmlFor="seoTitle">Titre SEO (facultatif)</label>
            <input id="seoTitle" name="seoTitle" defaultValue={page?.seoTitle} />
          </div>
          <div className="champ">
            <label htmlFor="seoDescription">Description SEO (facultatif)</label>
            <input id="seoDescription" name="seoDescription" defaultValue={page?.seoDescription} maxLength={320} />
          </div>
        </div>
        <label className="case" style={{ marginTop: 14 }}>
          <input type="checkbox" name="published" defaultChecked={page?.published ?? false} />
          Publier la page (sans cela, l’adresse renvoie une 404)
        </label>
      </fieldset>

      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        <button type="submit" className="btn btn--bleu" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <Link href="/admin/pages" className="btn btn--contour-bleu">Annuler</Link>
      </div>
    </form>
  );
}
