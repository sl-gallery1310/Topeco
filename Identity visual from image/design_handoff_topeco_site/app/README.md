# TOPECO — application Next.js + MySQL

Implémentation dynamique du prototype `design/TOPECO Site Web.dc.html` : site vitrine
(frontoffice), espace client B2B, back-office d’administration, base MySQL.

---

## 1. Pile technique

| Brique | Choix | Pourquoi |
|---|---|---|
| Framework | **Next.js 15**, App Router, TypeScript | rendu serveur pour le SEO du catalogue et du blog, Server Actions pour les formulaires, une seule application pour le front et le back-office |
| Base | **MySQL 8** | imposé ; `utf8mb4_unicode_ci` |
| Accès données | **Prisma 5** | schéma unique versionné, migrations SQL générées, typage de bout en bout |
| Auth | sessions maison (cookie httpOnly + table `Session`), bcrypt | pas de dépendance externe ; remplaçable par Auth.js sans toucher aux appels `login/currentUser/requireAdmin` |
| Validation | **Zod**, partagée client/serveur | mêmes règles dans le navigateur et sur le serveur (SIRET Luhn, téléphone FR, département) |
| E-mails | **Nodemailer** | notifications RDV / SAV / candidature ; journalise au lieu d’envoyer si SMTP absent |
| Styles | une feuille de jetons (`src/app/globals.css`) + styles inline | les valeurs viennent du brand book, aucune duplication |

Pas de librairie de composants, pas de Tailwind : la charte est courte et stricte, les
primitives (`.btn`, `.carte`, `.panneau`, `.tableau`, `.champ`) suffisent.

---

## 2. Installation

```bash
cd app
cp .env.example .env          # renseigner DATABASE_URL et SESSION_SECRET
npm install
npx prisma migrate dev --name init
npm run db:seed
npm run dev                   # http://localhost:3000
```

Comptes créés par le seed :

| Rôle | E-mail | Mot de passe | Entrée |
|---|---|---|---|
| Administrateur | `admin@topeco.fr` | `Topeco2026!` | `/admin` |
| Client pro (compte 10428) | `contact@comptoirdumarais.fr` | `Client2026!` | `/mon-compte` |

À changer avant toute mise en ligne. Voir `sql/README.md` pour la création de la base,
le dump `mysqldump` et l’import.

---

## 3. Arborescence

```
app/
├─ prisma/
│  ├─ schema.prisma          # 25 modèles : catalogue, réseau, éditorial, comptes, commerce, formulaires, RGPD
│  └─ seed.ts                # tout le contenu du prototype, idempotent
├─ sql/README.md             # création base, migrations, dump
├─ public/                   # mark.svg, mark-white.svg, uploads/
└─ src/
   ├─ lib/
   │  ├─ db.ts               # client Prisma (singleton)
   │  ├─ pricing.ts          # paliers + remise contractuelle + TVA  ← règle métier centrale
   │  ├─ format.ts           # fr-FR : euros, dates, espaces insécables, temps de lecture
   │  ├─ auth.ts             # login/logout, currentUser, requireClient, requireAdmin
   │  ├─ validation.ts       # schémas Zod (formulaires, filtres, produit)
   │  ├─ blocks.ts           # blocs de contenu (paragraphe, H2, H3, liste, encadré vert)
   │  ├─ settings.ts         # réglages éditables, en cache
   │  └─ constants.ts        # DEMO_MODE, mention « projet étudiant »
   ├─ components/site/       # Header, Footer, CookieBanner, Breadcrumbs, Price,
   │                         # ProductCard, ImagePlaceholder, Blocks, DealerSearchForm,
   │                         # ResellerMap, LoginForm, AddToCart
   ├─ server/actions/        # forms.ts (RDV, SAV, candidature) · auth.ts · account.ts · admin.ts
   ├─ middleware.ts          # garde-fou /admin et /mon-compte + en-têtes de sécurité
   └─ app/
      ├─ globals.css  layout.tsx  page.tsx           # accueil
      ├─ boutique/[category]/                        # catégorie + filtres URL + description dépliable
      │  └─ [product]/                               # fiche : galerie, paliers, quantité
      ├─ nos-revendeurs/                             # recherche, carte, candidature
      ├─ blog/  blog/[slug]/                         # liste + article (blocs)
      ├─ contact/                                    # RDV + SAV
      ├─ connexion/  mon-compte/                     # espace client
      ├─ [slug]/                                     # pages CMS (mentions légales, CGV…)
      ├─ api/                                        # consentement, revendeurs, panier, factures
      ├─ sitemap.ts  robots.ts
      └─ admin/                                      # back-office
```

---

## 4. Routes (frontoffice)

| Vue du prototype | Route | Source de données |
|---|---|---|
| 1 Accueil | `/` | `Category` (+ prix « dès » calculé), contenu éditorial en dur dans la page |
| 2 Catégorie | `/boutique/[category]` | `Category`, `Product`, filtres en query string |
| 3 Fiche produit | `/boutique/[category]/[product]` | `Product`, `PriceTier`, `ProductImage`, `Reseller` |
| 4 Revendeurs | `/nos-revendeurs` (+ `#devenir-revendeur`) | `Reseller`, `Territory`, `ResellerApplication` |
| 5 Blog | `/blog` (+ `?categorie=`) | `Article`, `ArticleCategory` |
| 6 Article | `/blog/[slug]` | `Article.bodyBlocks` |
| 7 Contact / RDV | `/contact` | `AppointmentSlot`, `Setting`, `Appointment`, `SupportRequest` |
| 8 Mon compte | `/mon-compte` (auth) | `Account`, `Order`, `Quote`, `RegulatoryDeadline` |
| 9 Mentions légales | `/mentions-legales` et autres pages | `Page.bodyBlocks` |
| — | `/connexion`, `/admin/*` | ajoutés (non designés) |

La barre sombre de navigation du prototype (`showChromeBar`) n’est pas reprise : elle
existait pour la revue.

### API

| Route | Méthode | Rôle |
|---|---|---|
| `/api/consentement` | POST | enregistre le choix cookies (cookie 1 an + trace `CookieConsent`) |
| `/api/revendeurs?q=&produit=` | GET | recherche revendeur par ville / code postal, filtrable par SKU ; journalise les recherches sans résultat |
| `/api/panier` | GET/POST | panier ; **le prix est recalculé côté serveur** (palier + remise) |
| `/api/factures/[reference]` | GET | téléchargement authentifié, fichier hors `public/` |

---

## 5. Règles métier à ne pas contourner

1. **Prix** : toujours HT **et** TTC. Montants stockés HT en centimes (`Int`), TTC dérivé.
   Un seul point de calcul : `src/lib/pricing.ts`.
2. **Remise contractuelle** appliquée **côté serveur**, partout où un prix est affiché une
   fois connecté — pas seulement sur la page « Vos tarifs professionnels ». Le navigateur
   n’envoie jamais un prix : `/api/panier` recalcule.
3. **Palier dégressif** : ligne `PriceTier` où `minQty ≤ qty ≤ maxQty` (`maxQty` nul = « et plus »).
   Le palier courant est mis en évidence dans le tableau et pilote le prix affiché.
4. **Consentement cookies** : rien de non essentiel avant le choix, refus en un clic, aussi
   visible que l’acceptation, révocable depuis le pied de page.
5. **Case de consentement RDV** jamais pré-cochée.
6. **Alerte réglementaire** du tableau de bord client : croisement de l’historique de
   commandes avec `RegulatoryDeadline` + `Product.agecStatus`, avec lien vers le remplacement.
7. **Mode projet étudiant** (`NEXT_PUBLIC_DEMO_MODE=true`) : la mention « aucun achat et
   aucune réservation ne peuvent être effectués » reste affichée, l’acceptation de devis ne
   crée pas de commande, l’ajout au panier n’ouvre aucun tunnel. Passer à `false` retire ces
   garde-fous — et seulement alors.
8. **Charte** : `#88B04B` jamais en texte ni en fond de bouton (CTA vert = `#5F7F2B`),
   angles droits, aucune ombre hors bandeau cookies, Montserrat pour les titres et
   l’interface, Open Sans pour le corps.

---

## 6. Back-office (`/admin`)

Livré :

- **Tableau de bord** — références, brouillons, candidatures/RDV/SAV à traiter, CA HT,
  dernières commandes, recherches revendeur sans résultat (zones à couvrir).
- **Produits** — liste filtrable, création/édition complète : identité, prix, matériau,
  contenance, description, points clés, **paliers dégressifs**, statut AGEC + échéance +
  produit de remplacement, stock, publication. Suppression = dépublication (les commandes
  référencent le produit).
- **Commandes et devis** — liste, changement de statut (répercuté sur `/mon-compte`).
- **Demandes reçues** — candidatures revendeur, RDV, SAV, avec changement de statut.
- **Réglages** — téléphone, horaires, e-mails, mentions TVA et projet étudiant, version de
  la politique cookies. Vidage du cache par tag.
- **Journal** (`AuditLog`) — chaque création, modification, changement de statut et connexion
  est tracé (exigence de traçabilité du dossier).

Sections restantes, à écrire sur le **même motif** que `/admin/produits`
(`page.tsx` liste + `[id]/page.tsx` formulaire + action dans `src/server/actions/admin.ts`,
`saveArticle` est déjà écrite) :

- catégories (intro, présentation SEO, encadré réglementaire, visuel) ;
- articles du blog (éditeur de blocs — un `<textarea>` JSON fonctionne, un éditeur
  bloc-par-bloc est préférable) ;
- pages de contenu (`Page`) ;
- revendeurs et territoires ;
- comptes clients (remise contractuelle, encours) ;
- créneaux de RDV (`AppointmentSlot`) ;
- échéances réglementaires ;
- consultation du journal.

Les entrées de menu correspondantes sont volontairement absentes du menu latéral tant
que les pages n’existent pas (`src/app/admin/layout.tsx`).

---

## 7. Ce qui reste à faire avant mise en ligne

1. **Écrans non designés** : panier, tunnel de commande, confirmation, résultats de
   recherche, mot de passe oublié. À concevoir avec les composants documentés avant de coder.
2. **Photographies** : tous les visuels manquants passent par `ImagePlaceholder`
   (« PHOTO PRODUIT À VENIR »). Deux photos réelles seulement sont fournies.
3. **Carte du réseau** : `ResellerMap` place les marqueurs depuis `lat`/`lng` mais le fond de
   carte est un rectangle — reporter les tracés de `design/carte-revendeurs.html` dans le SVG,
   ou brancher MapLibre. Conserver l’attribution Natural Earth.
4. **Pages `/cgv`, `/cgu`, `/confidentialite`, `/accessibilite`, `/plan-du-site`,
   `/nos-engagements`** : créer les enregistrements `Page` (sinon 404). Le seed ne crée que
   `mentions-legales` et un brouillon `nos-engagements`.
5. **Placeholders `[entre crochets]`** des mentions légales à remplir
   (voir `readme-projet-etudiant.txt`).
6. **Catalogue complet** : 9 produits sont seedés, le prototype en annonce 34.
7. **Factures et fiches de recyclabilité** : déposer les PDF dans `private/uploads/...`
   (factures, servies par `/api/factures/[reference]`) et `public/uploads/fiches/...`.
8. **Créneaux de RDV réels** : `AppointmentSlot` est alimenté par le seed avec les quatre
   créneaux du prototype ; brancher l’agenda commercial ou saisir au back-office.
9. **Anti-spam** : chaque formulaire a un honeypot ; ajouter une limitation de débit par IP
   (et un captcha si le volume l’exige).
10. **Accessibilité** : focus visible, `aria-expanded`, sémantique radio des créneaux et
    `aria-live` du sélecteur de quantité sont en place ; reste à vérifier les contrastes
    `#582900` sur `#F2F2E4` et `#C3D89A` sur `#2B4A9B` aux petites tailles, et à faire une
    passe lecteur d’écran.

---

## 8. Déploiement

**Hébergement Node requis** (les Server Actions et Prisma ne fonctionnent pas en mutualisé PHP).

- **Vercel + base MySQL managée** (PlanetScale, OVH, Scalingo) : le plus simple.
  Variables d’environnement à recopier depuis `.env.example` ; `npm run build` lance
  `prisma generate` ; exécuter `npx prisma migrate deploy` puis `npm run db:seed` une fois.
- **VPS / OVH Node** : `npm ci && npm run build && npm start` derrière Nginx, MySQL local,
  `pm2` ou un service systemd pour le redémarrage.

Points de vigilance : `SESSION_SECRET` unique et secret ; cookies `secure` en production
(déjà conditionné par `NODE_ENV`) ; sauvegarde MySQL programmée ; `NEXT_PUBLIC_SITE_URL`
correct pour le sitemap et les métadonnées Open Graph.

---

## 9. Dossier étudiant

- Script de création de la base : `prisma/migrations/<date>_init/migration.sql` (généré).
- Dump structure + données : `npm run db:dump` → `sql/topeco-dump.sql`.
- Identifiants back-office : section 2 (à changer, puis à reporter dans le dossier).
- Traçabilité des actions d’administration : table `AuditLog`.
- Mentions légales, CGV, CGU, politique de confidentialité : modèle `Page`, éditable au
  back-office ; l’avertissement « projet étudiant fictif » est piloté par `Setting`
  (`demo.notice`) et `NEXT_PUBLIC_DEMO_MODE`.
