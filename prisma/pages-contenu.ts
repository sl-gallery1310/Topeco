/**
 * Contenu des pages libres (modèle Page) référencées par la navigation et le pied de page.
 *
 * Règles de rédaction :
 * - « Nos engagements » ne reprend que des engagements DÉJÀ affichés ailleurs sur le site
 *   (accueil, catégories, fiches produit) : rien n'est inventé ici.
 * - Les pages juridiques suivent le motif de « Mentions légales » : avertissement
 *   « projet étudiant fictif », structure complète, et [crochets] pour chaque fait que
 *   seule l'entreprise peut fournir. Ce sont des trames, pas un avis juridique.
 * - Le seed ne remplace jamais une page modifiée au back-office (voir seed.ts).
 */
import type { Block } from "../src/lib/blocks";

const FICTIF: Block = {
  type: "disclaimer",
  text: "Ce site est réalisé dans le cadre d’un projet étudiant fictif. Aucun achat, aucun devis et aucune réservation ne peuvent réellement être effectués.",
};

export type ContenuPage = {
  slug: string;
  title: string;
  introHtml?: string;
  bodyBlocks: Block[];
};

export const PAGES_CONTENU: ContenuPage[] = [
  /* ------------------------------------------------------------ NOS ENGAGEMENTS */
  {
    slug: "nos-engagements",
    title: "Nos engagements",
    introHtml:
      "<p>Des emballages qui tiennent en cuisine, qui respectent la loi AGEC et qui ont une vraie filière de recyclage : voici ce à quoi nous nous engageons sur chaque référence.</p>",
    bodyBlocks: [
      { type: "h2", text: "Conformité réglementaire" },
      { type: "p", text: "Toutes nos références sont recyclables et conformes aux échéances de la loi AGEC en vigueur. Le conseil réglementaire est inclus sur chaque commande." },
      {
        type: "greenCallout",
        title: "Votre liste d’achats vérifiée gratuitement",
        text: "Nos conseillers vérifient gratuitement la conformité de votre liste d’achats actuelle et proposent un équivalent pour chaque ligne concernée par une interdiction à venir.",
        ctaLabel: "Prendre rendez-vous",
        ctaHref: "/contact",
      },

      { type: "h2", text: "Des matériaux choisis pour leur filière" },
      { type: "p", text: "Nous sélectionnons en priorité la fibre moulée et le carton certifié, qui offrent le meilleur compromis entre tenue au gras, résistance à la chaleur et filière de recyclage réellement disponible en France. Pour les barquettes, la fibre moulée et le carton à barrière aqueuse remplacent le polystyrène." },

      { type: "h2", text: "Chaque référence testée avant d’être proposée" },
      { type: "p", text: "Aucun produit n’entre au catalogue sans avoir passé trois essais :" },
      {
        type: "list",
        items: [
          "tenue à 80 °C pendant vingt minutes ;",
          "absence de migration sur préparations grasses ;",
          "empilabilité en armoire chaude.",
        ],
      },

      { type: "h2", text: "Transparence sur chaque produit" },
      { type: "p", text: "Les fiches techniques et de recyclabilité sont téléchargeables sur chaque page produit. Les couvercles sont systématiquement proposés avec le contenant correspondant, pour éviter les ruptures de compatibilité qui immobilisent un stock entier." },

      { type: "h2", text: "Le réemploi quand c’est possible" },
      { type: "p", text: "Nos pailles en inox 18/8 sont réutilisables, livrées avec leur goupillon de nettoyage et garanties à vie contre la déformation et la corrosion." },

      { type: "h2", text: "Une livraison au plus court" },
      { type: "p", text: "Livraison directe en 48 h en Île-de-France. Partout ailleurs, nos produits sont distribués par un réseau de revendeurs partenaires, au plus près de vos établissements." },
    ],
  },

  /* ------------------------------------------------------------------------ CGV */
  {
    slug: "cgv",
    title: "Conditions générales de vente",
    bodyBlocks: [
      FICTIF,
      { type: "h2", text: "1. Objet et champ d’application" },
      { type: "p", text: "Les présentes conditions régissent les ventes conclues entre [raison sociale], éditeur de la marque TOPECO, et ses clients professionnels (restaurants, boulangeries, traiteurs et autres établissements). Toute commande emporte leur acceptation sans réserve." },
      { type: "h2", text: "2. Clientèle professionnelle" },
      { type: "p", text: "Le site s’adresse exclusivement aux professionnels. Le client garantit agir pour les besoins de son activité ; les dispositions protectrices du droit de la consommation ne s’appliquent pas." },
      { type: "h2", text: "3. Prix" },
      { type: "p", text: "Les prix sont affichés hors taxes et toutes taxes comprises. Ils sont dégressifs selon la quantité commandée (paliers indiqués sur chaque fiche produit) et peuvent bénéficier de la remise contractuelle prévue au compte du client. Le prix applicable est celui calculé au moment de la commande." },
      { type: "h2", text: "4. Commande" },
      { type: "p", text: "La commande est ferme après confirmation écrite de [raison sociale]. [Préciser : minimum de commande, conditions d’acceptation, délai de validité des devis.]" },
      { type: "h2", text: "5. Paiement" },
      { type: "p", text: "[Préciser : moyens de paiement acceptés, échéance, conditions de l’encours client.] Tout retard de paiement entraîne l’application des pénalités légales et de l’indemnité forfaitaire pour frais de recouvrement de 40 € prévue par l’article L. 441-10 du Code de commerce." },
      { type: "h2", text: "6. Livraison" },
      { type: "p", text: "Livraison directe en 48 h en Île-de-France ; ailleurs, par l’intermédiaire du réseau de revendeurs partenaires. [Préciser : frais de port, franco de port, créneaux.] Le client vérifie la marchandise à réception et formule toute réserve sur le bon de livraison." },
      { type: "h2", text: "7. Garantie" },
      { type: "p", text: "Les produits bénéficient de la garantie légale des vices cachés. Les pailles en inox sont en outre garanties à vie contre la déformation et la corrosion. [Préciser : procédure de retour et délais de réclamation.]" },
      { type: "h2", text: "8. Responsabilité" },
      { type: "p", text: "[Préciser : limites de responsabilité, usages conformes des produits (températures, contact alimentaire).]" },
      { type: "h2", text: "9. Droit applicable et litiges" },
      { type: "p", text: "Les présentes conditions sont soumises au droit français. À défaut d’accord amiable, tout litige relève de la compétence du [tribunal de commerce compétent]." },
    ],
  },

  /* ------------------------------------------------------------------------ CGU */
  {
    slug: "cgu",
    title: "Conditions générales d’utilisation",
    bodyBlocks: [
      FICTIF,
      { type: "h2", text: "1. Objet" },
      { type: "p", text: "Les présentes conditions encadrent l’accès au site TOPECO et son utilisation. Naviguer sur le site vaut acceptation de ces conditions." },
      { type: "h2", text: "2. Accès au site" },
      { type: "p", text: "Le site est accessible gratuitement. Son éditeur s’efforce d’en assurer la disponibilité mais ne peut garantir un accès continu ; il peut l’interrompre pour maintenance." },
      { type: "h2", text: "3. Espace client" },
      { type: "p", text: "L’espace client est réservé aux établissements disposant d’un compte professionnel. Les identifiants sont personnels et confidentiels : toute action réalisée avec eux est réputée faite par le titulaire du compte, qui signale sans délai tout usage non autorisé." },
      { type: "h2", text: "4. Propriété intellectuelle" },
      { type: "p", text: "La marque TOPECO, son logo, les textes, photographies et éléments graphiques du site sont protégés. Toute reproduction sans autorisation préalable écrite est interdite." },
      { type: "h2", text: "5. Contenus et liens" },
      { type: "p", text: "Les informations réglementaires publiées sur le site, notamment sur la loi AGEC, sont données à titre indicatif et ne remplacent pas un conseil adapté à votre situation. L’éditeur n’est pas responsable des sites tiers vers lesquels le site renvoie." },
      { type: "h2", text: "6. Données personnelles et cookies" },
      { type: "p", text: "Le traitement des données personnelles et l’usage des cookies sont décrits dans la politique de confidentialité. Le choix des cookies reste modifiable à tout moment depuis le lien « Gestion des cookies » en pied de page." },
      { type: "h2", text: "7. Droit applicable" },
      { type: "p", text: "Les présentes conditions sont soumises au droit français." },
    ],
  },

  /* -------------------------------------------------------------- CONFIDENTIALITÉ */
  {
    slug: "confidentialite",
    title: "Politique de confidentialité",
    bodyBlocks: [
      FICTIF,
      { type: "h2", text: "Responsable du traitement" },
      { type: "p", text: "[Raison sociale], [adresse]. Contact pour toute question relative à vos données : [adresse e-mail dédiée]." },
      { type: "h2", text: "Données collectées et finalités" },
      {
        type: "list",
        items: [
          "Demande de rendez-vous : établissement, nom du gérant, téléphone, e-mail, département et besoins — pour organiser l’échange avec un conseiller.",
          "Demande de service après-vente : e-mail, référence de commande et message — pour traiter la demande.",
          "Candidature revendeur : informations sur l’entreprise candidate et ses contacts — pour étudier la candidature.",
          "Espace client : identifiants, commandes, devis et factures — pour exécuter la relation commerciale.",
          "Journal de sécurité : connexions et actions du back-office — pour assurer la traçabilité et la sécurité du service.",
        ],
      },
      { type: "h2", text: "Base légale" },
      { type: "p", text: "Les traitements reposent sur l’exécution de mesures précontractuelles ou du contrat (rendez-vous, commandes, espace client), sur l’intérêt légitime (sécurité, traçabilité) et, pour les cookies non nécessaires, sur votre consentement." },
      { type: "h2", text: "Durées de conservation" },
      { type: "p", text: "[Préciser la durée pour chaque catégorie de données, par exemple : prospects trois ans après le dernier contact, données de facturation dix ans.]" },
      { type: "h2", text: "Destinataires et hébergement" },
      { type: "p", text: "Les données sont destinées aux seules équipes de TOPECO concernées. Le site est hébergé par Vercel et la base de données par TiDB Cloud (PingCAP), dans la région de Francfort. [Préciser les garanties encadrant tout transfert hors de l’Union européenne.]" },
      { type: "h2", text: "Cookies" },
      { type: "p", text: "Seuls les cookies nécessaires au fonctionnement du site (session de connexion, mémorisation de votre choix) sont déposés sans votre accord. Les cookies de mesure d’audience et de personnalisation ne le sont qu’après consentement, que vous pouvez retirer à tout moment via « Gestion des cookies »." },
      { type: "h2", text: "Vos droits" },
      { type: "p", text: "Vous disposez d’un droit d’accès, de rectification, d’effacement, de limitation, d’opposition et de portabilité de vos données, à exercer auprès de [adresse e-mail dédiée]. Vous pouvez également introduire une réclamation auprès de la CNIL (cnil.fr)." },
    ],
  },

  /* ---------------------------------------------------------------- ACCESSIBILITÉ */
  {
    slug: "accessibilite",
    title: "Déclaration d’accessibilité",
    bodyBlocks: [
      FICTIF,
      { type: "p", text: "[Raison sociale] s’engage à rendre son site accessible conformément à l’article 47 de la loi n° 2005-102 du 11 février 2005." },
      { type: "h2", text: "État de conformité" },
      { type: "p", text: "Le site TOPECO n’a pas encore fait l’objet d’un audit de conformité au référentiel général d’amélioration de l’accessibilité (RGAA). En l’absence d’audit, il est déclaré non conforme." },
      { type: "h2", text: "Mesures déjà en place" },
      {
        type: "list",
        items: [
          "focus clavier visible sur tous les éléments interactifs ;",
          "lien d’évitement « Aller au contenu » en tête de page ;",
          "textes alternatifs décrivant chaque photographie produit ;",
          "formulaires étiquetés, erreurs signalées sous chaque champ ;",
          "liste textuelle des revendeurs accompagnant la carte interactive.",
        ],
      },
      { type: "h2", text: "Contenus à vérifier" },
      { type: "p", text: "Un audit devra notamment contrôler les contrastes de certaines associations de couleurs aux petites tailles de texte et le fonctionnement avec les lecteurs d’écran." },
      { type: "h2", text: "Retour d’information et contact" },
      { type: "p", text: "Si vous ne parvenez pas à accéder à un contenu ou à un service, contactez-nous à [adresse e-mail] : nous vous proposerons une alternative accessible." },
      { type: "h2", text: "Voies de recours" },
      { type: "p", text: "Si vous nous avez signalé un défaut d’accessibilité sans obtenir de réponse satisfaisante, vous pouvez saisir le Défenseur des droits (defenseurdesdroits.fr)." },
    ],
  },
];
