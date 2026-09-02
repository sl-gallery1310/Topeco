-- Dev-only: Prisma Migrate needs to create a temporary "shadow database"
-- to diff migrations, which requires CREATE DATABASE rights.
-- Never grant this in production — use `prisma migrate deploy` there instead.
GRANT ALL PRIVILEGES ON *.* TO 'topeco'@'%';
FLUSH PRIVILEGES;
