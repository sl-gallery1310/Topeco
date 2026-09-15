/**
 * Seed TOPECO — reprend mot pour mot les contenus du prototype
 * (design/TOPECO Site Web.dc.html). Idempotent : upsert sur les clés uniques.
 *
 *   npm run db:seed
 */
import { PrismaClient, Material, AgecStatus, ResellerType, ResellerStatus, TerritoryStatus, UserRole, OrderStatus, QuoteStatus } from "../src/generated/prisma/client";
import bcrypt from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PAGES_CONTENU } from "./pages-contenu";
import "dotenv/config";

// Prisma 7 : adaptateur de driver obligatoire.
const db = new PrismaClient({ adapter: new PrismaMariaDb(process.env.DATABASE_URL!) });
const eur = (v: number) => Math.round(v * 100); // 39.90 -> 3990 centimes

async function main() {
  /* ---------------------------------------------------------------- ARTICLES */
  const catAgec = await db.articleCategory.upsert({
    where: { slug: "loi-agec" },
    update: {},
    create: { slug: "loi-agec", name: "Loi AGEC", sortOrder: 1 },
  });
  const catMat = await db.articleCategory.upsert({
    where: { slug: "materiaux" },
    update: {},
    create: { slug: "materiaux", name: "Matériaux", sortOrder: 2 },
  });
  const catTemoin = await db.articleCategory.upsert({
    where: { slug: "temoignages" },
    update: {},
    create: { slug: "temoignages", name: "Témoignages", sortOrder: 3 },
  });

  const articleAgec = await db.article.upsert({
    where: { slug: "calendrier-loi-agec" },
    update: {},
    create: {
      slug: "calendrier-loi-agec",
      title: "Loi AGEC : le calendrier des interdictions et ce qu’il implique pour votre carte",
      dek: "Les échéances 2026 concernent la vaisselle jetable, les contenants de cuisson et les emballages de vente à emporter. Voici comment situer votre établissement, référence par référence.",
      eyebrow: "LOI AGEC",
      categoryId: catAgec.id,
      featured: true,
      published: true,
      publishedAt: new Date("2026-03-12T08:00:00Z"),
      heroImageAlt: "",
      disclaimerText:
        "Cet article est produit dans le cadre d’un projet étudiant fictif et ne constitue pas un conseil juridique. Vérifiez toujours les textes en vigueur auprès des sources officielles.",
      relatedCategoryId: null,
      bodyBlocks: [
        { type: "p", text: "La loi anti-gaspillage pour une économie circulaire échelonne ses interdictions depuis 2021. Chaque échéance retire du marché une famille d’articles, et l’essentiel du travail pour un restaurateur consiste à savoir laquelle de ses références tombe, et à quelle date." },
        { type: "h2", text: "Ce qui est déjà interdit" },
        { type: "p", text: "Pailles, couverts, touillettes, piques à steak et couvercles de boisson en plastique à usage unique ne peuvent plus être mis sur le marché. La vaisselle réutilisable est obligatoire pour la restauration sur place au-delà de vingt couverts." },
        { type: "h3", text: "Le cas de la vente à emporter" },
        { type: "p", text: "Les contenants de vente à emporter restent autorisés en usage unique, à condition de sortir des matières interdites. C’est la zone où les substitutions sont les plus nombreuses et les plus mal documentées." },
        { type: "list", items: [
          "Barquettes : la fibre moulée et le carton à barrière aqueuse remplacent le polystyrène.",
          "Gobelets : le double paroi carton remplace le gobelet plastique et son couvercle.",
          "Sacs : le kraft brut ou certifié remplace le plastique oxodégradable.",
          "Couverts : l’inox et le bois certifié remplacent le PLA, qui n’est pas une réponse suffisante.",
        ] },
        { type: "greenCallout", title: "Faire auditer vos références", text: "Envoyez-nous votre liste d’achats actuelle : nous identifions les lignes concernées par la prochaine échéance et proposons un équivalent conforme, avec le différentiel de prix au couvert servi.", ctaLabel: "Demander un audit gratuit", ctaHref: "/contact" },
        { type: "h2", text: "Comment s’organiser sans tout changer d’un coup" },
        { type: "p", text: "La substitution se planifie par ordre de volume : la référence la plus commandée est celle qui coûte le plus cher à changer en urgence. Un plan sur trois mois, ligne par ligne, absorbe la hausse sans rupture de stock." },
      ],
    },
  });

  const otherArticles = [
    {
      slug: "fibre-moulee-ou-carton",
      title: "Fibre moulée ou carton : lequel choisir selon votre carte",
      dek: "Résistance au gras, tenue à la chaleur, coût au couvert : les deux matières ne se valent pas selon ce que vous servez.",
      eyebrow: "MATÉRIAUX",
      categoryId: catMat.id,
      publishedAt: new Date("2026-03-04T08:00:00Z"),
    },
    {
      slug: "bistrot-parisien-14-references",
      title: "Un bistrot parisien remplace 14 références en trois mois",
      dek: "Le Comptoir du Marais a repris sa liste d’achats ligne par ligne. Retour sur le calendrier, les coûts et les surprises.",
      eyebrow: "TÉMOIGNAGE",
      categoryId: catTemoin.id,
      publishedAt: new Date("2026-02-26T08:00:00Z"),
    },
    {
      slug: "reutilisable-ou-jetable",
      title: "Réutilisable ou jetable : le calcul au verre servi",
      dek: "Le point d’équilibre d’une paille inox arrive plus vite qu’on ne le croit. Le calcul, hypothèses comprises.",
      eyebrow: "MATÉRIAUX",
      categoryId: catMat.id,
      publishedAt: new Date("2026-02-18T08:00:00Z"),
    },
  ];
  for (const a of otherArticles) {
    await db.article.upsert({
      where: { slug: a.slug },
      update: {},
      create: {
        ...a,
        published: true,
        featured: false,
        bodyBlocks: [
          { type: "p", text: "Corps de l’article à rédiger au back-office (éditeur de blocs : paragraphe, H2, H3, liste, encadré vert)." },
        ],
      },
    });
  }

  /* ---------------------------------------------------------------- CATÉGORIES */
  const cEmballages = await db.category.upsert({
    where: { slug: "emballages" },
    update: { imageUrl: "/uploads/categories/emballages.jpeg", imageAlt: "Sac kraft, boîte, barquette de salade, bol à couvercle transparent, gobelet de couverts en bois et serviettes, tous marqués TOPECO." },
    create: {
      slug: "emballages",
      name: "Emballages alimentaires",
      shortDescription: "Barquettes, boîtes repas, sacs kraft et couvercles compatibles.",
      introHtml:
        "<p>Barquettes, boîtes repas, sacs et couvercles pour la vente à emporter et la livraison. Toutes nos références sont recyclables et conformes aux échéances de la loi AGEC en vigueur.</p>",
      longDescriptionHtml:
        "<p>La famille emballages couvre l’ensemble du parcours d’un plat depuis la cuisine jusqu’au client : contenant, fermeture, transport et étiquetage. Nous sélectionnons en priorité la fibre moulée et le carton certifié, qui offrent le meilleur compromis entre tenue au gras, résistance à la chaleur et filière de recyclage réellement disponible en France.</p><p>Chaque référence est testée sur trois critères : tenue à 80 °C pendant vingt minutes, absence de migration sur préparations grasses, et empilabilité en armoire chaude. Les fiches techniques et de recyclabilité sont téléchargeables sur chaque page produit.</p><p>Les couvercles sont systématiquement proposés avec le contenant correspondant, pour éviter les ruptures de compatibilité qui immobilisent un stock entier. Les diamètres et emprises sont indiqués en millimètres.</p><p>Nos conseillers vérifient gratuitement la conformité de votre liste d’achats actuelle et proposent un équivalent pour chaque ligne concernée par une interdiction à venir.</p>",
      regulatoryNoteHtml:
        "<p>Les barquettes en polystyrène expansé et les contenants de cuisson en plastique à usage unique sont interdits. La fibre moulée et le carton à barrière aqueuse constituent les substituts admis dans cette catégorie.</p>",
      regulatoryArticleId: articleAgec.id,
      imageUrl: "/uploads/categories/emballages.jpeg",
      imageAlt: "Sac kraft, boîte, barquette de salade, bol à couvercle transparent, gobelet de couverts en bois et serviettes, tous marqués TOPECO.",
      sortOrder: 1,
    },
  });
  const cConsommables = await db.category.upsert({
    where: { slug: "consommables" },
    update: { imageUrl: "/uploads/categories/consommables.jpeg", imageAlt: "Gobelets kraft empilés, couverts en bois, pailles papier, serviettes et rouleau d’essuie-tout TOPECO." },
    create: {
      slug: "consommables",
      name: "Consommables",
      shortDescription: "Couverts, serviettes, films et étiquetage du quotidien.",
      introHtml: "<p>Le consommable du service : couverts, serviettes, papier, étiquetage et films. Commandé au même endroit, livré sur la même facture.</p>",
      imageUrl: "/uploads/categories/consommables.jpeg",
      imageAlt: "Gobelets kraft empilés, couverts en bois, pailles papier, serviettes et rouleau d’essuie-tout TOPECO.",
      sortOrder: 2,
    },
  });
  const cHygiene = await db.category.upsert({
    where: { slug: "hygiene" },
    update: { imageUrl: "/uploads/categories/hygiene.jpeg", imageAlt: "Distributeur d’essuie-mains, distributeur de savon mural, flacon pompe et lingettes TOPECO sur fond clair." },
    create: {
      slug: "hygiene",
      name: "Hygiène",
      shortDescription: "Nettoyage, désinfection et protection en cuisine.",
      introHtml: "<p>Produits d’entretien, désinfectants contact alimentaire et protections individuelles pour les cuisines professionnelles.</p>",
      imageUrl: "/uploads/categories/hygiene.jpeg",
      imageAlt: "Distributeur d’essuie-mains, distributeur de savon mural, flacon pompe et lingettes TOPECO sur fond clair.",
      placeholderLabel: "VISUEL HYGIÈNE À VENIR",
      sortOrder: 3,
    },
  });
  const cPailles = await db.category.upsert({
    where: { slug: "pailles-inox" },
    update: { imageUrl: "/uploads/categories/pailles-inox.jpeg", imageAlt: "Pailles en inox droites et coudées dans un verre marqué TOPECO, avec leur goupillon de nettoyage." },
    create: {
      slug: "pailles-inox",
      name: "Pailles inox",
      shortDescription: "Réutilisables, garanties à vie, goupillon inclus.",
      introHtml: "<p>Pailles en inox 18/8 réutilisables, droites ou coudées, livrées avec goupillon de nettoyage. Garanties à vie.</p>",
      imageUrl: "/uploads/categories/pailles-inox.jpeg",
      imageAlt: "Pailles en inox droites et coudées dans un verre marqué TOPECO, avec leur goupillon de nettoyage.",
      placeholderLabel: "VISUEL PAILLES INOX À VENIR",
      sortOrder: 4,
    },
  });

  /* ---------------------------------------------------------------- PRODUITS */
  type Seed = {
    sku: string; slug: string; categoryId: number; name: string; lotLabel: string;
    priceHt: number; material?: Material; capacityMl?: number; agec?: AgecStatus;
    specLine?: string; warranty?: boolean; sample?: boolean;
    tiers?: [number, number | null, number][]; descriptionHtml?: string; bullets?: string[];
    /** Photo produit : sans elle, la fiche et la carte affichent ImagePlaceholder. */
    image?: { url: string; alt: string };
  };

  const products: Seed[] = [
    { sku: "TPE-EMB-BFM750", slug: "barquette-fibre-moulee-750ml", categoryId: cEmballages.id, name: "Barquette fibre moulée 750 ml", lotLabel: "Lot de 300 · avec couvercle", priceHt: eur(39.90), material: Material.FIBRE_MOULEE, capacityMl: 750, image: { url: "/uploads/produits/barquette-fibre-moulee-750ml.jpeg", alt: "Barquette rectangulaire en fibre moulée beige, ouverte, son couvercle assorti posé en biais et marqué du logo TOPECO." } },
    { sku: "TPE-EMB-SKP250", slug: "sac-kraft-poignees-plates", categoryId: cEmballages.id, name: "Sac kraft à poignées plates", lotLabel: "Lot de 250 · 26 × 17 × 32 cm", priceHt: eur(21.50), material: Material.KRAFT_BRUT, image: { url: "/uploads/produits/sac-kraft-poignees-plates.jpeg", alt: "Sac en papier kraft brun à poignées plates, debout, imprimé du logo TOPECO." } },
    { sku: "TPE-EMB-GDP250", slug: "gobelet-double-paroi-25cl", categoryId: cEmballages.id, name: "Gobelet double paroi 25 cl", lotLabel: "Lot de 500 · couvercles inclus", priceHt: eur(29.90), material: Material.CARTON_CERTIFIE, capacityMl: 250, image: { url: "/uploads/produits/gobelet-double-paroi-25cl.jpeg", alt: "Gobelet en carton kraft à double paroi imprimé du logo TOPECO, son couvercle blanc posé à côté." } },
    { sku: "TPE-EMB-BRC1000", slug: "boite-repas-carton-1000ml", categoryId: cEmballages.id, name: "Boîte repas carton 1 000 ml", lotLabel: "Lot de 200 · barrière aqueuse", priceHt: eur(34.20), material: Material.CARTON_CERTIFIE, capacityMl: 1000, image: { url: "/uploads/produits/boite-repas-carton-1000ml.jpeg", alt: "Boîte repas en carton kraft fermée, logo TOPECO sur le couvercle et sur la face avant avec la mention « emballages éco-responsables » et le volume 1 000 ml." } },
    { sku: "TPE-EMB-PSI1000", slug: "pochette-sandwich-ingraissable", categoryId: cEmballages.id, name: "Pochette sandwich ingraissable", lotLabel: "Lot de 1 000 · kraft brun", priceHt: eur(15.60), material: Material.KRAFT_BRUT, image: { url: "/uploads/produits/pochette-sandwich-ingraissable.jpeg", alt: "Pochette en papier kraft brun imprimée du logo TOPECO, garnie d’un sandwich ciabatta salade, tomate et fromage." } },
    { sku: "TPE-EMB-CPET750", slug: "couvercle-pet-recycle-750ml", categoryId: cEmballages.id, name: "Couvercle PET recyclé 750 ml", lotLabel: "Lot de 300 · compatible barquette fibre", priceHt: eur(18.40), material: Material.PET_RECYCLE, capacityMl: 750, agec: AgecStatus.A_SURVEILLER, image: { url: "/uploads/produits/couvercle-pet-recycle-750ml.jpeg", alt: "Couvercle plat transparent en PET recyclé marqué du logo TOPECO, vu de trois quarts." } },
    { sku: "TPE-CON-CVB500", slug: "couverts-bois-certifie", categoryId: cConsommables.id, name: "Couverts bois certifié", lotLabel: "Lot de 500 · fourchette + couteau", priceHt: eur(3.20) },
    { sku: "TPE-HYG-DES5L", slug: "desinfectant-contact-alimentaire-5l", categoryId: cHygiene.id, name: "Désinfectant contact alimentaire 5 L", lotLabel: "Bidon de 5 L · sans rinçage", priceHt: eur(6.30) },
    {
      sku: "TPE-INX-050", slug: "lot-50-pailles-inox", categoryId: cPailles.id,
      name: "Lot de 50 pailles inox réutilisables", lotLabel: "Lot de 50 · goupillon inclus",
      specLine: "inox 18/8 · 21,5 cm · goupillon inclus", priceHt: eur(24.90),
      material: Material.INOX, warranty: true, sample: true,
      tiers: [[1, 4, eur(24.90)], [5, 9, eur(22.40)], [10, 24, eur(19.90)], [25, null, eur(17.40)]],
      descriptionHtml:
        "<p>Paille droite en inox 18/8 alimentaire, diamètre intérieur 6 mm, longueur 21,5 cm : la hauteur d’un verre à cocktail standard. Passe au lave-vaisselle en panier à couverts, ne transmet aucun goût et ne se déforme pas à l’usage. Le goupillon nylon fourni nettoie l’intérieur en un passage.</p>",
      bullets: [
        "Inox 18/8 alimentaire, sans revêtement ni soudure apparente",
        "Compatible lave-vaisselle professionnel, cycle 60 °C",
        "Goupillon de nettoyage nylon inclus pour 50 pailles",
        "Garantie à vie contre la déformation et la corrosion",
      ],
    },
  ];

  const bySku: Record<string, number> = {};
  for (const p of products) {
    const row = await db.product.upsert({
      where: { sku: p.sku },
      update: {},
      create: {
        sku: p.sku, slug: p.slug, categoryId: p.categoryId, name: p.name,
        lotLabel: p.lotLabel, specLine: p.specLine ?? null,
        descriptionHtml: p.descriptionHtml ?? null, bullets: p.bullets ?? undefined,
        basePriceHt: p.priceHt, material: p.material ?? null, capacityMl: p.capacityMl ?? null,
        agecStatus: p.agec ?? AgecStatus.CONFORME,
        lifetimeWarranty: p.warranty ?? false, sampleAvailable: p.sample ?? false,
        recyclabilityUrl: "/uploads/fiches/" + p.sku.toLowerCase() + "-recyclabilite.pdf",
        recyclabilitySize: 184320,
      },
    });
    bySku[p.sku] = row.id;
    if (p.image) {
      // Pas de contrainte d'unicite sur ProductImage : on verifie avant d'inserer
      // pour que le seed reste rejouable sans dupliquer les photos.
      const deja = await db.productImage.findFirst({ where: { productId: row.id, url: p.image.url } });
      if (!deja) {
        await db.productImage.create({
          data: { productId: row.id, url: p.image.url, alt: p.image.alt, isPrimary: true, sortOrder: 0 },
        });
      }
    }
    if (p.tiers) {
      for (const [minQty, maxQty, unitPriceHt] of p.tiers) {
        await db.priceTier.upsert({
          where: { productId_minQty: { productId: row.id, minQty } },
          update: { maxQty, unitPriceHt },
          create: { productId: row.id, minQty, maxQty, unitPriceHt },
        });
      }
    }
  }

  /* ---------------------------------------------------------------- RÉSEAU */
  const resellers = [
    { companyName: "Livraison directe TOPECO", type: ResellerType.DIRECT, status: ResellerStatus.ACTIVE, regionLabel: "Île-de-France", city: "Paris", postcode: "75001", lat: 48.8566, lng: 2.3522, ctaLabel: "Commander en ligne", ctaHref: "/boutique/emballages", sortOrder: 1, note: "48 h" },
    { companyName: "Métro · Promocash", type: ResellerType.PARTNER, status: ResellerStatus.ACTIVE, regionLabel: "Hauts-de-France · Grand Est", city: "Strasbourg", postcode: "67000", lat: 48.5734, lng: 7.7521, pickupPointCount: 4, sortOrder: 2 },
    { companyName: "Métro · Chomette", type: ResellerType.PARTNER, status: ResellerStatus.ACTIVE, regionLabel: "Auvergne-Rhône-Alpes", city: "Lyon", postcode: "69002", lat: 45.7640, lng: 4.8357, pickupPointCount: 5, sortOrder: 3 },
    { companyName: "Promocash · Chomette", type: ResellerType.PARTNER, status: ResellerStatus.ACTIVE, regionLabel: "Nouvelle-Aquitaine · Occitanie", city: "Toulouse", postcode: "31000", lat: 43.6047, lng: 1.4442, pickupPointCount: 6, sortOrder: 4 },
    { companyName: "Métro", type: ResellerType.PARTNER, status: ResellerStatus.ACTIVE, regionLabel: "Bretagne · Pays de la Loire", city: "Nantes", postcode: "44000", lat: 47.2184, lng: -1.5536, pickupPointCount: 3, sortOrder: 5 },
    { companyName: "Recherche de partenaire en cours", type: ResellerType.PARTNER, status: ResellerStatus.AVAILABLE, regionLabel: "Provence-Alpes-Côte d’Azur", city: "Marseille", postcode: "13001", lat: 43.2965, lng: 5.3698, ctaLabel: "Territoire disponible", ctaHref: "/nos-revendeurs#devenir-revendeur", sortOrder: 6 },
  ];
  for (const r of resellers) {
    const { note, ...data } = r as typeof r & { note?: string };
    const existing = await db.reseller.findFirst({ where: { companyName: data.companyName, regionLabel: data.regionLabel } });
    const row = existing ?? (await db.reseller.create({ data }));
    // tous les revendeurs partenaires stockent la référence phare
    await db.resellerStock.upsert({
      where: { resellerId_productId: { resellerId: row.id, productId: bySku["TPE-INX-050"] } },
      update: {}, create: { resellerId: row.id, productId: bySku["TPE-INX-050"] },
    });
  }

  const territories: [string, TerritoryStatus][] = [
    ["Provence-Alpes-Côte d’Azur", TerritoryStatus.AVAILABLE],
    ["Bourgogne-Franche-Comté", TerritoryStatus.AVAILABLE],
    ["Normandie", TerritoryStatus.AVAILABLE],
    ["Centre-Val de Loire", TerritoryStatus.AVAILABLE],
    ["Corse", TerritoryStatus.AVAILABLE],
    ["Île-de-France", TerritoryStatus.TAKEN],
  ];
  for (const [regionName, status] of territories) {
    await db.territory.upsert({ where: { regionName }, update: {}, create: { regionName, status } });
  }

  /* ---------------------------------------------------------------- COMPTE CLIENT */
  const account = await db.account.upsert({
    where: { accountNumber: "10428" },
    update: {},
    create: {
      accountNumber: "10428",
      companyName: "Le Comptoir du Marais",
      contactName: "Camille Ferrand",
      email: "contact@comptoirdumarais.fr",
      phone: "01 00 00 00 00",
      contractDiscountPct: "12.00",
      creditLimitHt: 150000,
      paymentTerms: "30 jours fin de mois",
      billingAddress: "12 rue des Archives\n75004 Paris",
      shippingAddress: "12 rue des Archives\n75004 Paris",
    },
  });

  await db.user.upsert({
    where: { email: "admin@topeco.fr" },
    update: {},
    create: {
      email: "admin@topeco.fr", name: "Administrateur TOPECO",
      role: UserRole.ADMIN, passwordHash: await bcrypt.hash("Topeco2026!", 10),
    },
  });
  await db.user.upsert({
    where: { email: "contact@comptoirdumarais.fr" },
    update: {},
    create: {
      email: "contact@comptoirdumarais.fr", name: "Camille Ferrand",
      role: UserRole.CLIENT, accountId: account.id,
      passwordHash: await bcrypt.hash("Client2026!", 10),
    },
  });

  /* ---------------------------------------------------------------- COMMANDES / DEVIS */
  const orders = [
    { reference: "CMD-26-0412", placedAt: new Date("2026-04-18"), totalHt: eur(486.20), status: OrderStatus.LIVREE, deliveryMethod: "Livraison directe 48 h" },
    { reference: "CMD-26-0388", placedAt: new Date("2026-04-02"), totalHt: eur(212.80), status: OrderStatus.LIVREE, deliveryMethod: "Livraison directe 48 h" },
    { reference: "CMD-26-0351", placedAt: new Date("2026-03-21"), totalHt: eur(874.00), status: OrderStatus.FACTURE_A_REGLER, deliveryMethod: "Livraison directe 48 h" },
  ];
  for (const o of orders) {
    const vat = Math.round(o.totalHt * 0.2);
    await db.order.upsert({
      where: { reference: o.reference },
      update: {},
      create: {
        ...o, accountId: account.id, vatAmount: vat, totalTtc: o.totalHt + vat,
        discountPct: "12.00", invoiceUrl: "/uploads/factures/" + o.reference + ".pdf",
        lines: {
          create: [
            { productId: bySku["TPE-EMB-BFM750"], sku: "TPE-EMB-BFM750", name: "Barquette fibre moulée 750 ml", qty: 4, unitPriceHt: eur(35.11), lineTotalHt: eur(140.44) },
            { productId: bySku["TPE-INX-050"], sku: "TPE-INX-050", name: "Lot de 50 pailles inox réutilisables", qty: 2, unitPriceHt: eur(21.91), lineTotalHt: eur(43.82) },
          ],
        },
      },
    });
  }

  const quotes = [
    { reference: "DEV-26-0091", label: "remplacement couverts", validUntil: new Date("2026-05-30"), totalHt: eur(318.00) },
    { reference: "DEV-26-0102", label: "pailles inox marquées", validUntil: new Date("2026-06-12"), totalHt: eur(597.00) },
  ];
  for (const q of quotes) {
    await db.quote.upsert({
      where: { reference: q.reference },
      update: {},
      create: {
        ...q, accountId: account.id, status: QuoteStatus.EN_COURS,
        totalTtc: Math.round(q.totalHt * 1.2),
        pdfUrl: "/uploads/devis/" + q.reference + ".pdf",
        lines: { create: [{ productId: bySku["TPE-CON-CVB500"], sku: "TPE-CON-CVB500", name: "Couverts bois certifié", qty: 100, unitPriceHt: eur(3.18), lineTotalHt: eur(318.00) }] },
      },
    });
  }

  /* ---------------------------------------------------------------- CRÉNEAUX RDV */
  const slots = [
    ["Mardi 10 h – 10 h 30", "2026-09-01T08:00:00Z", "2026-09-01T08:30:00Z"],
    ["Mardi 15 h – 15 h 30", "2026-09-01T13:00:00Z", "2026-09-01T13:30:00Z"],
    ["Mercredi 9 h 30 – 10 h", "2026-09-02T07:30:00Z", "2026-09-02T08:00:00Z"],
    ["Jeudi 16 h – 16 h 30", "2026-09-03T14:00:00Z", "2026-09-03T14:30:00Z"],
  ];
  for (const [label, s, e] of slots) {
    const found = await db.appointmentSlot.findFirst({ where: { label } });
    if (!found) await db.appointmentSlot.create({ data: { label, startsAt: new Date(s), endsAt: new Date(e) } });
  }

  /* ---------------------------------------------------------------- RÉGLEMENTAIRE */
  const dl = await db.regulatoryDeadline.findFirst({ where: { label: { startsWith: "Interdiction des couvercles" } } });
  if (!dl) {
    await db.regulatoryDeadline.create({
      data: {
        label: "Interdiction des couvercles plastique à usage unique pour boissons",
        effectiveOn: new Date("2026-12-31"),
        descriptionHtml: "<p>Les couvercles de boisson en plastique à usage unique sortent du marché. Prévoir un équivalent carton ou une consigne réutilisable.</p>",
        affectedMaterials: ["PET_RECYCLE"],
        affectedSkus: ["TPE-EMB-CPET750"],
        articleId: articleAgec.id,
      },
    });
  }

  /* ---------------------------------------------------------------- PAGES + RÉGLAGES */
  await db.page.upsert({
    where: { slug: "mentions-legales" },
    update: {},
    create: {
      slug: "mentions-legales",
      title: "Mentions légales",
      bodyBlocks: [
        { type: "disclaimer", text: "Ce site est réalisé dans le cadre d’un projet étudiant fictif. Aucun achat, aucun devis et aucune réservation ne peuvent réellement être effectués." },
        { type: "h2", text: "Éditeur du site" },
        { type: "p", text: "TOPECO, marque de GWESERG, SARL fondée en 2012 — [numéro de groupe], [établissement]." },
        { type: "h2", text: "Hébergement" },
        { type: "p", text: "[nom de l’hébergeur], [adresse], [téléphone]." },
      ],
    },
  });
  // Pages libres de la navigation et du pied de page (prisma/pages-contenu.ts).
  // Créée si absente, remplie si son corps est encore vide (ancien brouillon du
  // prototype), et sinon laissée intacte : une page retouchée au back-office
  // n'est jamais écrasée par un nouveau seed.
  for (const pg of PAGES_CONTENU) {
    const existante = await db.page.findUnique({ where: { slug: pg.slug }, select: { bodyBlocks: true } });
    const vide = !existante || !Array.isArray(existante.bodyBlocks) || existante.bodyBlocks.length === 0;
    if (!vide) continue;
    const data = {
      title: pg.title,
      introHtml: pg.introHtml ?? null,
      bodyBlocks: pg.bodyBlocks,
      published: true,
    };
    await db.page.upsert({ where: { slug: pg.slug }, update: data, create: { slug: pg.slug, ...data } });
  }

  const settings = [
    ["contact.phone", "01 00 00 00 00", "Téléphone", "contact"],
    ["contact.hours", "du lundi au vendredi, 8 h – 18 h", "Horaires", "contact"],
    ["contact.email", "contact@topeco.fr", "E-mail public", "contact"],
    ["contact.warehouse", "Entrepôt et retrait sur rendez-vous — Zone d’activités, Île-de-France — adresse communiquée à la commande", "Entrepôt", "contact"],
    ["contact.access", "Accès : RER et bus à moins de 10 minutes à pied · stationnement poids lourds sur site · quai de chargement ouvert de 7 h à 17 h", "Accès entrepôt", "contact"],
    ["demo.notice", "© 2026 TOPECO — projet étudiant fictif : aucun achat et aucune réservation ne peuvent être effectués sur ce site.", "Mention projet étudiant", "demo"],
    ["demo.formNotice", "Démonstration : aucune donnée n’est réellement transmise.", "Mention formulaires", "demo"],
    ["legal.vatNotice", "Tous nos prix sont affichés hors taxes et toutes taxes comprises.", "Mention TVA", "legal"],
    ["cookies.policyVersion", "2026-01", "Version de la politique cookies", "legal"],
  ];
  for (const [key, value, label, group] of settings) {
    await db.setting.upsert({ where: { key }, update: {}, create: { key, value, label, group } });
  }

  console.log("Seed terminé.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
