"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { savePage, type AdminState } from "@/server/actions/admin";
import BlockEditor from "@/components/admin/BlockEditor";
import type { Block } from "@/lib/blocks";

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

export default function PageForm({ page, slugPrefill }: { page: P | null; slugPrefill?: string }) {
  const [state, action, pending] = useActionState(savePage, {} as AdminState);
  const [blocks, setBlocks] = useState<Block[]>(page?.bodyBlocks ?? []);
  const err = (k: string) => state.errors?.[k]?.[0];

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
        <BlockEditor blocks={blocks} setBlocks={setBlocks} erreur={err("bodyBlocks")} />
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
