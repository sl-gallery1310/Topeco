<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# TOPECO — conventions du projet

Next.js 16 (App Router) · Prisma 7 · MySQL 8 · sessions maison · CSS de charte, **ni
Tailwind ni librairie de composants**. Voir [README.md](README.md) : pile, installation,
routes, règles métier et reste à faire.

## Structure

Routes en français. Deux coquilles, séparées par un groupe de routes — les groupes
ne changent aucune URL :

- `src/app/(site)/` — site public : `/`, `/boutique/[category]/[product]`,
  `/nos-revendeurs`, `/blog`, `/contact`, `/connexion`, `/mon-compte`,
  `/[slug]` (pages CMS). Sa coquille `(site)/layout.tsx` porte l’en-tête, le pied
  de page et le bandeau cookies.
- `src/app/admin/` — back-office, **hors** du groupe : sa propre coquille, sans la
  navigation publique. Y ajouter une page ne demande rien de plus.
- `src/app/api/`, `sitemap.ts`, `robots.ts` — hors coquille.

`src/app/layout.tsx` ne porte que le document (langue, polices, `globals.css`) :
n’y remettre ni en-tête ni pied de page, ils réapparaîtraient dans le back-office.

## Règles

- **Charte** : les valeurs sont dans `src/app/globals.css` et nulle part ailleurs.
  Composer avec les primitives existantes (`.conteneur`, `.section`, `.carte`,
  `.panneau`, `.tableau`, `.champ`, `.btn`) plutôt que d’ajouter du CSS.
  Ne pas introduire Tailwind ni une librairie de composants : c’est une décision de
  conception, pas un manque. `#88B04B` jamais en texte ni en fond de bouton (CTA vert =
  `#5F7F2B`), angles droits, aucune ombre hors bandeau cookies.
- **Prix** : un seul point de calcul, `src/lib/pricing.ts`. Montants stockés HT en
  centimes (`Int`), TTC dérivé, affichage toujours HT **et** TTC. La remise
  contractuelle s’applique côté serveur ; le navigateur n’envoie jamais un prix.
- **Auth** : `login` / `currentUser` / `requireClient` / `requireAdmin` dans
  `src/lib/auth.ts`. Rôles `ADMIN`, `EDITOR`, `CLIENT`. `src/proxy.ts` ne fait que
  rediriger sur absence de cookie — le contrôle des droits reste dans la page.
- **Edge** : `src/proxy.ts` s’exécute sur l’edge — ni Prisma, ni bcrypt, ni
  `src/lib/env.ts` (marqué `server-only`). Y lire `process.env` directement.
- **Env** : partout ailleurs, passer par `src/lib/env.ts` (validé au démarrage).
- **Validation** : schémas Zod 4 dans `src/lib/validation.ts`, partagés client/serveur.
- **Base** : accès par `db` (`src/lib/db.ts`). Prisma 7 génère dans
  `src/generated/prisma` — importer depuis `@/generated/prisma/client`, jamais
  `@prisma/client`. Relancer `npm run db:generate` après toute modification du schéma.
- **Back-office** : les sections restantes suivent le motif de `/admin/produits`
  (`page.tsx` liste + `[id]/page.tsx` formulaire + action dans
  `src/server/actions/admin.ts`). Tracer toute écriture dans `AuditLog`.
- **Mode démo** : `NEXT_PUBLIC_DEMO_MODE` reste à `true` tant que le projet est fictif.
- Next 16 : le fichier s’appelle `proxy.ts`, pas `middleware.ts`.

## Avant de rendre la main

```bash
npm run typecheck && npm run lint && npm run build
```
