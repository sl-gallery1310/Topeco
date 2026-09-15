# TOPECO — application Next.js + MySQL

Implémentation dynamique du prototype `design/TOPECO Site Web.dc.html` : site vitrine
(frontoffice), espace client B2B, back-office d’administration, base MySQL.

---

## 1. Pile technique

| Brique | Choix | Pourquoi |
|---|---|---|
| Framework | **Next.js 16**, App Router, TypeScript | rendu serveur pour le SEO du catalogue et du blog, Server Actions pour les formulaires, une seule application pour le front et le back-office |
| Base | **MySQL 8** | imposé ; `utf8mb4_unicode_ci` |
| Accès données | **Prisma 7** | schéma unique versionné, migrations SQL générées, typage de bout en bout ; accès MySQL par l’adaptateur de driver `@prisma/adapter-mariadb`, client généré dans `src/generated/prisma` |
| Auth | sessions maison (cookie httpOnly + table `Session`), bcrypt | pas de dépendance externe ; remplaçable par Auth.js sans toucher aux appels `login/currentUser/requireAdmin` |
| Validation | **Zod 4**, partagée client/serveur | mêmes règles dans le navigateur et sur le serveur (SIRET Luhn, téléphone FR, département) |
| E-mails | **Nodemailer** | notifications RDV / SAV / candidature ; journalise au lieu d’envoyer si SMTP absent |
| Styles | une feuille de jetons (`src/app/globals.css`) + styles inline | les valeurs viennent du brand book, aucune duplication |

Pas de librairie de composants, pas de Tailwind : la charte est courte et stricte, les
primitives (`.btn`, `.carte`, `.panneau`, `.tableau`, `.champ`) suffisent.

---

## 2. Installation

Prérequis : Node.js 20.19+ et Docker Desktop (ou un MySQL 8 à soi).

```bash
cp .env.example .env          # renseigner SESSION_SECRET
npm install
npm run setup                 # base + client Prisma + migration + seed
npm run dev                   # http://localhost:3000
```

`npm run setup` enchaîne `db:up`, `db:generate`, `db:migrate` et `db:seed`.

Comptes créés par le seed :

| Rôle | E-mail | Mot de passe | Entrée |
|---|---|---|---|
| Administrateur | `admin@topeco.fr` | `Topeco2026!` | `/admin` |
| Client pro (compte 10428) | `contact@comptoirdumarais.fr` | `Client2026!` | `/mon-compte` |

À changer avant toute mise en ligne. Voir `sql/README.md` pour la création de la base,
le dump `mysqldump` et l’import.

### Variables d’environnement

Toutes sont listées dans `.env.example`. Celles marquées **oui** empêchent l’application
de démarrer si elles manquent : `src/lib/env.ts` les valide au lancement et échoue avec
un message lisible plutôt qu’une erreur Prisma obscure.

| Variable | Requise | Rôle |
|---|:---:|---|
| `DATABASE_URL` | **oui** | `mysql://user:mdp@hôte:port/base` |
| `SESSION_SECRET` | **oui** | 32 octets aléatoires — `openssl rand -base64 32`. En changer invalide toutes les sessions. |
| `SESSION_COOKIE_NAME` | non | `topeco_session` par défaut |
| `NEXT_PUBLIC_SITE_URL` | non | URL publique : sitemap, robots, métadonnées Open Graph. **À corriger en production**, sinon les URL absolues pointent sur localhost. |
| `NEXT_PUBLIC_DEMO_MODE` | non | `true` tant que le projet est fictif (voir règle 7) |
| `SMTP_HOST` `SMTP_PORT` `SMTP_USER` `SMTP_PASSWORD` | non | sans `SMTP_HOST` + `SMTP_USER`, les formulaires journalisent le message au lieu de l’envoyer — pratique en local, à brancher en production |
| `MAIL_FROM` `MAIL_TO_SALES` `MAIL_TO_SUPPORT` `MAIL_TO_NETWORK` | non | expéditeur et destinataires des formulaires |
| `DB_USER` `DB_PASSWORD` `DB_NAME` | non | uniquement `npm run db:dump` |

Les variables `NEXT_PUBLIC_*` sont inlinées dans le bundle navigateur au moment du
build : n’y mettre aucun secret, et refaire un build après les avoir changées.

### Base de données

`docker-compose.yml` lance MySQL 8.4 et Adminer.

- MySQL : `localhost:3308` — **3308 et non 3306**, un `mysqld` local occupe déjà 3306
  sur la machine de développement. Base / utilisateur / mot de passe : `topeco`.
- Adminer : <http://localhost:8081> (serveur `mysql`).

`docker/mysql/init/01-dev-grants.sql` accorde à l’utilisateur `topeco` le droit de créer
la « shadow database » dont Prisma Migrate a besoin pour diffuser les migrations. Il ne
s’exécute qu’à la première création du volume — **développement uniquement** ; en
production, `npm run db:deploy` n’en a pas besoin.

Pour utiliser un MySQL existant plutôt que Docker : pointer `DATABASE_URL` dessus et
sauter `npm run db:up`.

### Scripts

| Script | Rôle |
|---|---|
| `npm run dev` / `build` / `start` | serveur de dev · build de production · service du build |
| `npm run typecheck` / `lint` | `tsc --noEmit` · ESLint |
| `npm run setup` | base + génération + migration + seed |
| `npm run db:up` / `db:down` | démarre / arrête le conteneur MySQL |
| `npm run db:migrate` / `db:deploy` | migration (dev) · application des migrations (prod) |
| `npm run db:generate` | régénère le client Prisma (après toute modification du schéma) |
| `npm run db:seed` / `db:reset` | seed · remise à zéro complète |
| `npm run db:studio` / `db:dump` | Prisma Studio · dump SQL |

---

## 3. Arborescence

```
.
├─ docker-compose.yml        # MySQL 8.4 + Adminer
├─ docker/mysql/init/        # droits « shadow database » (dev uniquement)
├─ prisma7.config.ts         # config CLI Prisma 7 (URL, chemin des migrations, seed)
├─ prisma/
│  ├─ schema.prisma          # 29 modèles : catalogue, réseau, éditorial, comptes, commerce, formulaires, RGPD
│  ├─ migrations/            # SQL généré
│  └─ seed.ts                # tout le contenu du prototype, idempotent
├─ sql/README.md             # création base, migrations, dump
├─ public/                   # mark.svg, mark-white.svg
│  └─ uploads/               # categories/ et produits/ (photos posées par le seed)
└─ src/
   ├─ generated/prisma/      # client Prisma généré (non versionné)
   ├─ lib/
   │  ├─ db.ts               # client Prisma (singleton + adaptateur MariaDB)
   │  ├─ env.ts              # validation des variables d’environnement au démarrage
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
   ├─ proxy.ts               # garde-fou /admin et /mon-compte + en-têtes de sécurité
   │                         # (« proxy » = l’ex-middleware, renommé par Next 16)
   └─ app/
      ├─ globals.css  layout.tsx                     # document seul : langue, polices, charte
      ├─ (site)/                                     # coquille publique (en-tête, pied, cookies)
      │  ├─ layout.tsx  page.tsx                     # accueil
      │  ├─ boutique/[category]/                     # catégorie + filtres URL + description dépliable
      │  │  └─ [product]/                            # fiche : galerie, paliers, quantité
      │  ├─ nos-revendeurs/                          # recherche, carte, candidature
      │  ├─ blog/  blog/[slug]/                      # liste + article (blocs)
      │  ├─ contact/                                 # RDV + SAV
      │  ├─ connexion/  mon-compte/                  # espace client
      │  └─ [slug]/                                  # pages CMS (mentions légales, CGV…)
      ├─ api/                                        # consentement, revendeurs, panier, factures, health
      ├─ sitemap.ts  robots.ts
      └─ admin/                                      # back-office (hors coquille publique)
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
| `/api/health` | GET | sonde de disponibilité + connectivité MySQL |

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
- **Pages** — pages de contenu libre (`Page`) : liste, création, édition, publication et
  dépublication, avec un éditeur bloc par bloc (paragraphe, H2, H3, liste, encadré vert,
  avertissement, image) plutôt qu’un `<textarea>` JSON. La liste signale les adresses
  référencées par la navigation et le pied de page qui n’ont pas encore de page publiée
  — sans quoi le lien renvoie une 404.
- **Journal** (`AuditLog`) — chaque création, modification, changement de statut et connexion
  est tracé (exigence de traçabilité du dossier).

Sections restantes, à écrire sur le **même motif** que `/admin/produits`
(`page.tsx` liste + `[id]/page.tsx` formulaire + action dans `src/server/actions/admin.ts`,
`saveArticle` est déjà écrite) :

- catégories (intro, présentation SEO, encadré réglementaire, visuel) ;
- articles du blog (éditeur de blocs — un `<textarea>` JSON fonctionne, un éditeur
  bloc-par-bloc est préférable) ;
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
2. **Photographies** : les quatre catégories et six produits sur neuf sont
   photographiés (`public/uploads/categories/`, `public/uploads/produits/`, posés par le
   seed). La catégorie Emballages est complète. Restent sans visuel :
   `couverts-bois-certifie`, `desinfectant-contact-alimentaire-5l` et
   `lot-50-pailles-inox`, qui affichent `ImagePlaceholder` (« PHOTO PRODUIT À VENIR »)
   tant qu’aucune photo n’est fournie.
3. ~~**Carte du réseau**~~ — fait : `ResellerMap` utilise Leaflet avec les tuiles
   OpenStreetMap (carte libre, sans clé d’API), marqueurs colorés selon type/statut et
   infobulle au clic. L’attribution ODbL est affichée par Leaflet ; la liste des
   revendeurs à côté reste le chemin accessible. Les tuiles viennent d’un tiers : elles
   ne posent pas de cookie, mais transmettent l’IP du visiteur — à arbitrer si le
   consentement doit les précéder.
4. **Pages `/cgv`, `/cgu`, `/confidentialite`, `/accessibilite`, `/plan-du-site`,
   `/nos-engagements`** : à rédiger et publier depuis `/admin/pages`, qui les signale tant
   qu’elles manquent. Sans page publiée, le lien renvoie une 404. Le seed ne crée que
   `mentions-legales` et un brouillon vide `nos-engagements` : les contenus sont à écrire,
   ce ne sont pas des textes qu’un tiers peut inventer à votre place.
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

**Hébergement Node requis** : Server Actions, Prisma et le proxy ne tournent pas sur un
mutualisé PHP. Le conteneur MySQL de `docker-compose.yml` est un outil de développement —
il n’est pas fait pour être exposé.

### 8.1 Base de données managée

Vercel et Netlify n’hébergent pas de MySQL : il faut une base ailleurs, joignable depuis
Internet et en TLS. Le MySQL d’un hébergement mutualisé convient rarement : il n’accepte
en général que des connexions locales, et les IP de Vercel changent sans cesse.

| Hébergeur | Gratuit | Remarque |
|---|:---:|---|
| **TiDB Cloud Starter** *(recommandé)* | oui | compatible MySQL, pris en charge par Prisma. Certificats Let’s Encrypt, déjà reconnus par Node : `ssl=true` suffit, aucun fichier de certificat. Choix de la région. Port **4000**. |
| Aiven for MySQL | oui | 1 Go de disque, 76 connexions max. Région **imposée**, service **éteint après inactivité** (réactivation manuelle), certificat signé par l’autorité d’Aiven : il faudrait ajouter sa prise en charge dans `src/lib/db.ts`. |
| Railway, Clever Cloud, Scaleway, OVH | payant | conviennent, quelques euros par mois |
| PlanetScale | payant | n’applique pas les clés étrangères : ajouter `relationMode = "prisma"` au bloc `datasource` **avant** la première migration |

#### Format de `DATABASE_URL`

```
mysql://UTILISATEUR:MOTDEPASSE@HÔTE:PORT/BASE?ssl=true&sslaccept=strict&connectionLimit=3
```

La même URL sert à deux lecteurs qui ne comprennent pas les mêmes paramètres :

| Paramètre | Lu par | Effet |
|---|---|---|
| `ssl=true` | le pilote `mariadb` (l’application) | active TLS et vérifie le certificat du serveur |
| `sslaccept=strict` | la CLI Prisma (`migrate deploy`) | active TLS côté migrations |
| `connectionLimit=3` | le pilote `mariadb` | taille du pool par instance serverless (10 par défaut) |

Chacun ignore les paramètres de l’autre. **`sslaccept=strict` seul ne suffit pas** : le
pilote l’ignore et l’application se connecterait sans TLS — ou serait refusée par un
hébergeur qui l’exige. Un mot de passe contenant `@`, `:`, `/` ou `?` doit être encodé
(`encodeURIComponent`).

#### Région

Vercel exécute les fonctions à Washington (`iad1`) par défaut. Avec une base en Europe,
chaque requête SQL traverserait l’Atlantique : régler **Settings → Functions → Region** sur
`fra1` (Francfort) ou `cdg1` (Paris), et créer la base dans la même zone.

### 8.2 Appliquer le schéma et le contenu

Depuis un poste, en pointant sur la base de production — jamais `migrate dev`, qui
compare et peut réinitialiser :

```bash
DATABASE_URL="mysql://…prod…" npx prisma migrate deploy   # crée les 29 tables
DATABASE_URL="mysql://…prod…" npm run db:seed             # catégories, produits, pages, comptes
```

Le seed est idempotent (upserts) : le rejouer ne duplique rien. Il crée les deux comptes
de la section 2 — **changer leurs mots de passe immédiatement après**.

Les migrations suivantes se rejouent de la même manière. Ne pas mettre `migrate deploy`
dans la commande de build : deux builds simultanés se marcheraient dessus.

### 8.3 Vercel

1. Importer le dépôt. Le framework est détecté (Next.js) ; ne rien changer aux commandes :
   `npm run build` lance déjà `prisma generate` avant `next build`, ce qui est
   indispensable, le client généré n’étant pas versionné.
2. Renseigner les variables d’environnement de la section 2 pour *Production* (et
   *Preview* si les aperçus doivent fonctionner). `NEXT_PUBLIC_SITE_URL` = l’URL réelle.
3. Déployer, puis exécuter les commandes de la section 8.2 si ce n’est pas déjà fait.

À surveiller : chaque instance serverless ouvre son propre pool de connexions, d’où le
`connectionLimit=3` de l’URL (8.1). Sur une base à quota serré, le baisser encore ou passer
par le pooler de l’hébergeur.

### 8.4 Netlify

1. Importer le dépôt. Netlify détecte Next.js et installe son runtime ; commande de build
   `npm run build`, répertoire publié `.next`.
2. Mêmes variables d’environnement qu’en 8.3, plus `NODE_VERSION=22` si la version par
   défaut est plus ancienne que 20.19.
3. Déployer, puis section 8.2.

À vérifier avant de s’engager : le support de Next 16 par le runtime Netlify évolue vite.
Si le proxy (`src/proxy.ts`) ou les Server Actions se comportent mal, c’est le premier
endroit à regarder — Vercel reste le chemin le moins surprenant pour cette version.

### 8.5 VPS / OVH Node

`npm ci && npm run build && npm start` derrière Nginx, MySQL local, `pm2` ou une unité
systemd pour le redémarrage. Le plus simple à auditer, le plus manuel à maintenir.

### 8.6 Avant d’ouvrir au public

- [ ] `SESSION_SECRET` propre à la production, jamais celui du dépôt
- [ ] mots de passe des comptes seedés changés
- [ ] `NEXT_PUBLIC_SITE_URL` = l’URL réelle (sitemap, robots, Open Graph)
- [ ] `NEXT_PUBLIC_DEMO_MODE=false` **uniquement** quand le site cesse d’être fictif : ce
      drapeau retire les garde-fous décrits en règle 7
- [ ] SMTP renseigné, sinon les demandes de RDV et de SAV ne partent nulle part
- [ ] pages `/cgv`, `/cgu`, `/confidentialite`, `/accessibilite`, `/plan-du-site`,
      `/nos-engagements` rédigées et publiées depuis `/admin/pages` (sinon 404 dans la
      navigation et le pied de page)
- [ ] sauvegarde MySQL programmée
- [ ] cookies `secure` : déjà conditionné par `NODE_ENV`, rien à faire, mais à vérifier
      derrière un proxy qui terminerait le TLS

---

## 9. Dossier étudiant

- Script de création de la base : `prisma/migrations/<date>_init/migration.sql` (généré).
- Dump structure + données : `npm run db:dump` → `sql/topeco-dump.sql`.
- Identifiants back-office : section 2 (à changer, puis à reporter dans le dossier).
- Traçabilité des actions d’administration : table `AuditLog`.
- Mentions légales, CGV, CGU, politique de confidentialité : modèle `Page`, éditable au
  back-office ; l’avertissement « projet étudiant fictif » est piloté par `Setting`
  (`demo.notice`) et `NEXT_PUBLIC_DEMO_MODE`.


---

## 10. Portage depuis le dossier de remise

Le code vient de `Identity visual from image/design_handoff_topeco_site/app/`, conservé
en l’état comme référence. Les pages, la feuille de charte et les règles métier n’ont
pas été retouchées ; seule la plomberie a été alignée sur les versions installées.

| Sujet | Remise | Ici | Raison |
|---|---|---|---|
| Next.js | 15 | 16 | `middleware.ts` → `proxy.ts` (export par défaut) |
| Cache par tag | `revalidateTag("settings")` | `revalidateTag("settings", { expire: 0 })` | Next 16 impose un second argument ; `{ expire: 0 }` reproduit l’ancien comportement (purge immédiate) |
| Prisma | 5, `prisma-client-js` | 7, `prisma-client` | sortie explicite `src/generated/prisma`, adaptateur `@prisma/adapter-mariadb` ; les imports `@prisma/client` pointent désormais vers le client généré |
| Zod | 3 | 4 | `z.string({ required_error })` → `{ error }` ; `z.literal(true, { errorMap })` → `{ error }` |
| bcryptjs | 2 (+ `@types`) | 3 | types embarqués, `@types/bcryptjs` inutile |
| Config Prisma | `package.json` | `prisma7.config.ts` | format Prisma 7 (URL, migrations, seed) |
| Base | MySQL local 3306 | Docker MySQL 8.4 sur 3308 | 3306 déjà occupé par un `mysqld` local |

Deux correctifs de code, au-delà du portage :

1. `src/components/site/ResellerMap.tsx` — `<title>{a} — {b}</title>` donne à React un
   tableau de trois nœuds, qu’il refuse dans un `<title>` : les infobulles des marqueurs
   de la carte étaient vides et chaque rendu écrivait un avertissement en console.
   Passé en gabarit de chaîne unique.
2. `src/app/admin/produits/[id]/page.tsx` — le littéral passé en prop à `ProductForm`
   porte des colonnes absentes du type `P` (`vatRate`, `images`, dates). Extrait dans une
   variable intermédiaire, ce qui lève le contrôle de propriétés surnuméraires sans
   changer les données transmises.

### Vérifié au démarrage

Toutes les routes publiques répondent 200 (accueil, 4 catégories, fiches produit, filtres
d’URL, revendeurs, blog et articles, contact, connexion, pages CMS, `sitemap.xml`,
`robots.txt`, `/api/health`, `/api/revendeurs`). La connexion par formulaire fonctionne
pour les deux rôles et pose le cookie de session ; le back-office complet et
`/mon-compte` s’affichent avec les données du seed ; un compte `CLIENT` est bien renvoyé
vers `/admin/connexion?erreur=droits`, et un visiteur anonyme vers la page de connexion.

---

## 11. Dépannage

**`Jest worker encountered N child process exceptions` / la page plante en dev.**
Deux processus écrivent dans le même `.next` : un `next dev` resté en arrière-plan, ou un
`npm run build` lancé pendant que le serveur de dev tourne. Un seul `next dev` par dossier,
et pas de build en parallèle. Pour s’en sortir : arrêter les processus Node du projet,
`rm -rf .next`, relancer. La vraie erreur n’est pas dans la superposition du navigateur
mais dans `.next/dev/logs/next-development.log`.

**`Another next dev server is already running`.** Next 16 refuse un second serveur sur le
même dossier et affiche le PID à arrêter. Attention : tuer le `npm run dev` ne tue pas
toujours le `next dev` enfant.

**Le port 3306 est déjà pris.** Un MySQL local occupe souvent 3306 ; le conteneur publie
donc sur **3308**. Pour changer, modifier `docker-compose.yml` *et* `DATABASE_URL`.

**`P3014 : Prisma Migrate could not create the shadow database`.** L’utilisateur MySQL n’a
pas le droit de créer une base. En local, `docker/mysql/init/01-dev-grants.sql` le fait au
premier démarrage du volume ; si le volume existait déjà, rejouer la commande à la main ou
`docker compose down -v` puis `npm run db:up`. En production, `migrate deploy` n’a pas
besoin de shadow database.

**`npm install prisma` installe une préversion.** Le tag `latest` du paquet `prisma` a
pointé sur une 8.0.0-rc alors que `@prisma/client` restait en 7. Garder les deux sur la
même version majeure : `npm install -D prisma@^7`.

**Types Prisma introuvables après modification du schéma.** Le client est généré dans
`src/generated/prisma`, hors `node_modules` et non versionné : relancer
`npm run db:generate` (et après un `git clone`, `npm run build` s’en charge).

**Les photos ou la carte ne s’affichent pas.** Les visuels sont posés par le seed
(`npm run db:seed`) ; sans lui, produits et catégories retombent sur `ImagePlaceholder`.
La carte charge ses tuiles depuis OpenStreetMap : sans réseau, le fond reste vide, les
marqueurs et la liste restent corrects.
