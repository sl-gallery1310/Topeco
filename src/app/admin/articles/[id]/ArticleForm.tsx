"use client";
import { useActionState, useState } from "react";
import Link from "next/link";
import { saveArticle, type AdminState } from "@/server/actions/admin";
import BlockEditor from "@/components/admin/BlockEditor";
import type { Block } from "@/lib/blocks";

type A = {
  id: number;
  slug: string;
  title: string;
  dek: string;
  eyebrow: string;
  categoryId: number;
  heroImageUrl: string;
  heroImageAlt: string;
  disclaimerText: string;
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
  published: boolean;
  bodyBlocks: Block[];
};

export default function ArticleForm({
  article,
  categories,
}: {
  article: A | null;
  categories: { id: number; name: string }[];
}) {
  const [state, action, pending] = useActionState(saveArticle, {} as AdminState);
  const [blocks, setBlocks] = useState<Block[]>(article?.bodyBlocks ?? []);
  const err = (k: string) => state.errors?.[k]?.[0];

  return (
    <form action={action} className="panneau" noValidate>
      {article && <input type="hidden" name="id" value={article.id} />}
      <input type="hidden" name="bodyBlocks" value={JSON.stringify(blocks)} />

      {err("_form") && <p className="erreur" role="alert" style={{ marginBottom: 14 }}>{err("_form")}</p>}

      <fieldset>
        <legend>Identité</legend>
        <div className="admin__grille-champs" style={{ marginTop: 12 }}>
          <div className={"champ" + (err("title") ? " champ--erreur" : "")}>
            <label htmlFor="title">Titre *</label>
            <input id="title" name="title" defaultValue={article?.title} required />
            {err("title") && <p className="erreur">{err("title")}</p>}
          </div>
          <div className={"champ" + (err("slug") ? " champ--erreur" : "")}>
            <label htmlFor="slug">Adresse (URL) *</label>
            <input id="slug" name="slug" defaultValue={article?.slug} placeholder="calendrier-loi-agec" required />
            {err("slug")
              ? <p className="erreur">{err("slug")}</p>
              : <p style={{ fontSize: 13.5, color: "var(--texte-3)" }}>Servi sur /blog/{article?.slug ?? "adresse"}</p>}
          </div>
          <div className={"champ" + (err("categoryId") ? " champ--erreur" : "")}>
            <label htmlFor="categoryId">Rubrique *</label>
            <select id="categoryId" name="categoryId" defaultValue={article?.categoryId ?? categories[0]?.id} required>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {err("categoryId") && <p className="erreur">{err("categoryId")}</p>}
          </div>
          <div className="champ">
            <label htmlFor="eyebrow">Surtitre (facultatif)</label>
            <input id="eyebrow" name="eyebrow" defaultValue={article?.eyebrow} placeholder="À LA UNE · LOI AGEC" />
          </div>
        </div>

        <div className={"champ" + (err("dek") ? " champ--erreur" : "")} style={{ marginTop: 16 }}>
          <label htmlFor="dek">Chapô *</label>
          <textarea id="dek" name="dek" defaultValue={article?.dek} maxLength={400} style={{ minHeight: 80 }} required />
          {err("dek")
            ? <p className="erreur">{err("dek")}</p>
            : <p style={{ fontSize: 13.5, color: "var(--texte-3)" }}>Affiché dans la liste du blog. 400 caractères maximum.</p>}
        </div>
      </fieldset>

      <fieldset style={{ marginTop: 26, borderTop: "1px solid var(--bordure)", paddingTop: 20 }}>
        <legend>Corps de l’article</legend>
        <BlockEditor blocks={blocks} setBlocks={setBlocks} erreur={err("bodyBlocks")} />
      </fieldset>

      <fieldset style={{ marginTop: 26, borderTop: "1px solid var(--bordure)", paddingTop: 20 }}>
        <legend>Visuel et avertissement</legend>
        <div className="admin__grille-champs" style={{ marginTop: 12 }}>
          <div className="champ">
            <label htmlFor="heroImageUrl">Image d’en-tête (facultatif)</label>
            <input id="heroImageUrl" name="heroImageUrl" defaultValue={article?.heroImageUrl} placeholder="/uploads/photo.jpeg" />
          </div>
          <div className="champ">
            <label htmlFor="heroImageAlt">Texte alternatif</label>
            <input id="heroImageAlt" name="heroImageAlt" defaultValue={article?.heroImageAlt} />
          </div>
        </div>
        <div className="champ" style={{ marginTop: 16 }}>
          <label htmlFor="disclaimerText">Avertissement en pied d’article (facultatif)</label>
          <textarea id="disclaimerText" name="disclaimerText" defaultValue={article?.disclaimerText} style={{ minHeight: 70 }} />
        </div>
      </fieldset>

      <fieldset style={{ marginTop: 26, borderTop: "1px solid var(--bordure)", paddingTop: 20 }}>
        <legend>Référencement et publication</legend>
        <div className="admin__grille-champs" style={{ marginTop: 12 }}>
          <div className="champ">
            <label htmlFor="seoTitle">Titre SEO (facultatif)</label>
            <input id="seoTitle" name="seoTitle" defaultValue={article?.seoTitle} />
          </div>
          <div className="champ">
            <label htmlFor="seoDescription">Description SEO (facultatif)</label>
            <input id="seoDescription" name="seoDescription" defaultValue={article?.seoDescription} maxLength={320} />
          </div>
        </div>
        <label className="case" style={{ marginTop: 14 }}>
          <input type="checkbox" name="featured" defaultChecked={article?.featured ?? false} />
          Mettre à la une du blog
        </label>
        <label className="case">
          <input type="checkbox" name="published" defaultChecked={article?.published ?? false} />
          Publier l’article (sans cela, l’adresse renvoie une 404)
        </label>
      </fieldset>

      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
        <button type="submit" className="btn btn--bleu" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </button>
        <Link href="/admin/articles" className="btn btn--contour-bleu">Annuler</Link>
      </div>
    </form>
  );
}
