# SQL / base de données

La DDL MySQL n’est **pas écrite à la main** : elle est générée depuis `prisma/schema.prisma`.
Une seule source de vérité, pas de dérive possible entre le code et la base.

## Créer la base et les tables

```sql
CREATE DATABASE topeco CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'topeco'@'localhost' IDENTIFIED BY 'topeco';
GRANT ALL PRIVILEGES ON topeco.* TO 'topeco'@'localhost';
FLUSH PRIVILEGES;
```

```bash
cp .env.example .env        # renseigner DATABASE_URL
npm install
npx prisma migrate dev --name init   # crée les tables + génère le SQL
npm run db:seed                      # insère toutes les données du prototype
```

`npx prisma migrate dev` écrit le script MySQL complet dans
`prisma/migrations/<horodatage>_init/migration.sql` — c’est ce fichier que vous joignez au
dossier si un script de création de base vous est demandé.

## Dump pour la clé USB / le rendu

```bash
npm run db:dump             # → sql/topeco-dump.sql (structure + données)
```

ou, sans passer par npm :

```bash
mysqldump --no-tablespaces -u topeco -p topeco > sql/topeco-dump.sql
```

Réimport : `mysql -u topeco -p topeco < sql/topeco-dump.sql`

## Encodage

`utf8mb4_unicode_ci` obligatoire : les contenus utilisent l’apostrophe typographique `’`,
les espaces insécables avant `€ % h`, et les accents dans les titres.

## Comptes créés par le seed

| Rôle | E-mail | Mot de passe |
|---|---|---|
| Administrateur back-office | `admin@topeco.fr` | `Topeco2026!` |
| Client professionnel (compte 10428) | `contact@comptoirdumarais.fr` | `Client2026!` |

**À changer avant toute mise en ligne** (et à noter dans le dossier de rendu, qui demande les
identifiants du back-office).
