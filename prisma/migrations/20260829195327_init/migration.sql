-- CreateTable
CREATE TABLE `Category` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(80) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `shortDescription` VARCHAR(255) NOT NULL,
    `introHtml` TEXT NOT NULL,
    `longDescriptionHtml` TEXT NULL,
    `regulatoryNoteHtml` TEXT NULL,
    `regulatoryArticleId` INTEGER NULL,
    `imageUrl` VARCHAR(255) NULL,
    `imageAlt` VARCHAR(255) NULL,
    `placeholderLabel` VARCHAR(80) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `seoTitle` VARCHAR(200) NULL,
    `seoDescription` VARCHAR(320) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    INDEX `Category_sortOrder_idx`(`sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sku` VARCHAR(40) NOT NULL,
    `slug` VARCHAR(120) NOT NULL,
    `categoryId` INTEGER NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `lotLabel` VARCHAR(160) NULL,
    `specLine` VARCHAR(200) NULL,
    `descriptionHtml` TEXT NULL,
    `bullets` JSON NULL,
    `basePriceHt` INTEGER NOT NULL,
    `vatRate` DECIMAL(4, 3) NOT NULL DEFAULT 0.20,
    `material` ENUM('FIBRE_MOULEE', 'CARTON_CERTIFIE', 'KRAFT_BRUT', 'PET_RECYCLE', 'INOX', 'AUTRE') NULL,
    `capacityMl` INTEGER NULL,
    `sampleAvailable` BOOLEAN NOT NULL DEFAULT false,
    `lifetimeWarranty` BOOLEAN NOT NULL DEFAULT false,
    `recyclabilityUrl` VARCHAR(255) NULL,
    `recyclabilitySize` INTEGER NULL,
    `agecStatus` ENUM('CONFORME', 'A_SURVEILLER', 'A_REMPLACER') NOT NULL DEFAULT 'CONFORME',
    `agecDeadline` DATETIME(3) NULL,
    `replacementProductId` INTEGER NULL,
    `stockStatus` ENUM('EN_STOCK', 'SUR_COMMANDE', 'EPUISE', 'ARRETE') NOT NULL DEFAULT 'EN_STOCK',
    `published` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Product_sku_key`(`sku`),
    UNIQUE INDEX `Product_slug_key`(`slug`),
    INDEX `Product_categoryId_published_idx`(`categoryId`, `published`),
    INDEX `Product_material_idx`(`material`),
    INDEX `Product_agecStatus_idx`(`agecStatus`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ProductImage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `alt` VARCHAR(255) NOT NULL,
    `isPrimary` BOOLEAN NOT NULL DEFAULT false,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    INDEX `ProductImage_productId_sortOrder_idx`(`productId`, `sortOrder`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PriceTier` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `productId` INTEGER NOT NULL,
    `minQty` INTEGER NOT NULL,
    `maxQty` INTEGER NULL,
    `unitPriceHt` INTEGER NOT NULL,

    INDEX `PriceTier_productId_idx`(`productId`),
    UNIQUE INDEX `PriceTier_productId_minQty_key`(`productId`, `minQty`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reseller` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyName` VARCHAR(160) NOT NULL,
    `type` ENUM('DIRECT', 'PARTNER') NOT NULL DEFAULT 'PARTNER',
    `status` ENUM('ACTIVE', 'PROSPECTING', 'AVAILABLE') NOT NULL DEFAULT 'ACTIVE',
    `regionLabel` VARCHAR(160) NOT NULL,
    `regionCodes` JSON NULL,
    `city` VARCHAR(120) NULL,
    `postcode` VARCHAR(10) NULL,
    `address` VARCHAR(255) NULL,
    `lat` DECIMAL(9, 6) NULL,
    `lng` DECIMAL(9, 6) NULL,
    `phone` VARCHAR(30) NULL,
    `pickupPointCount` INTEGER NOT NULL DEFAULT 0,
    `ctaLabel` VARCHAR(80) NULL,
    `ctaHref` VARCHAR(200) NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,

    INDEX `Reseller_postcode_idx`(`postcode`),
    INDEX `Reseller_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResellerStock` (
    `resellerId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,

    PRIMARY KEY (`resellerId`, `productId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Territory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `regionName` VARCHAR(120) NOT NULL,
    `status` ENUM('TAKEN', 'PROSPECTING', 'AVAILABLE') NOT NULL DEFAULT 'AVAILABLE',
    `assignedResellerId` INTEGER NULL,

    UNIQUE INDEX `Territory_regionName_key`(`regionName`),
    UNIQUE INDEX `Territory_assignedResellerId_key`(`assignedResellerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ResellerApplication` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `companyName` VARCHAR(160) NOT NULL,
    `siret` VARCHAR(14) NOT NULL,
    `contactName` VARCHAR(160) NOT NULL,
    `email` VARCHAR(190) NOT NULL,
    `territoryId` INTEGER NOT NULL,
    `annualRevenueBand` ENUM('UNDER_500K', 'BETWEEN_500K_2M', 'OVER_2M') NULL,
    `clientsAndVolumes` TEXT NULL,
    `status` ENUM('NEW', 'QUALIFYING', 'ACCEPTED', 'REJECTED') NOT NULL DEFAULT 'NEW',
    `internalNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ResellerApplication_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ArticleCategory` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(60) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ArticleCategory_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Article` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(160) NOT NULL,
    `title` VARCHAR(240) NOT NULL,
    `dek` VARCHAR(400) NOT NULL,
    `eyebrow` VARCHAR(80) NULL,
    `categoryId` INTEGER NOT NULL,
    `bodyBlocks` JSON NOT NULL,
    `heroImageUrl` VARCHAR(255) NULL,
    `heroImageAlt` VARCHAR(255) NULL,
    `disclaimerText` TEXT NULL,
    `relatedCategoryId` INTEGER NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `published` BOOLEAN NOT NULL DEFAULT false,
    `publishedAt` DATETIME(3) NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `seoTitle` VARCHAR(200) NULL,
    `seoDescription` VARCHAR(320) NULL,

    UNIQUE INDEX `Article_slug_key`(`slug`),
    INDEX `Article_published_publishedAt_idx`(`published`, `publishedAt`),
    INDEX `Article_featured_idx`(`featured`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Page` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(120) NOT NULL,
    `title` VARCHAR(200) NOT NULL,
    `introHtml` TEXT NULL,
    `bodyBlocks` JSON NOT NULL,
    `published` BOOLEAN NOT NULL DEFAULT true,
    `seoTitle` VARCHAR(200) NULL,
    `seoDescription` VARCHAR(320) NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Page_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(190) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `name` VARCHAR(160) NOT NULL,
    `role` ENUM('ADMIN', 'EDITOR', 'CLIENT') NOT NULL DEFAULT 'CLIENT',
    `accountId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `lastLoginAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_accountId_idx`(`accountId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `id` VARCHAR(64) NOT NULL,
    `userId` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `userAgent` VARCHAR(255) NULL,
    `ip` VARCHAR(45) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Session_userId_idx`(`userId`),
    INDEX `Session_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PasswordResetToken` (
    `id` VARCHAR(64) NOT NULL,
    `userId` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `usedAt` DATETIME(3) NULL,

    INDEX `PasswordResetToken_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Account` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountNumber` VARCHAR(20) NOT NULL,
    `companyName` VARCHAR(190) NOT NULL,
    `contactName` VARCHAR(160) NULL,
    `email` VARCHAR(190) NOT NULL,
    `phone` VARCHAR(30) NULL,
    `siret` VARCHAR(14) NULL,
    `billingAddress` TEXT NULL,
    `shippingAddress` TEXT NULL,
    `contractDiscountPct` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `creditLimitHt` INTEGER NOT NULL DEFAULT 0,
    `paymentTerms` VARCHAR(120) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Account_accountNumber_key`(`accountNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reference` VARCHAR(20) NOT NULL,
    `accountId` INTEGER NOT NULL,
    `placedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `status` ENUM('EN_PREPARATION', 'EXPEDIEE', 'LIVREE', 'FACTURE_A_REGLER', 'ANNULEE') NOT NULL DEFAULT 'EN_PREPARATION',
    `totalHt` INTEGER NOT NULL,
    `vatAmount` INTEGER NOT NULL,
    `totalTtc` INTEGER NOT NULL,
    `discountPct` DECIMAL(5, 2) NOT NULL DEFAULT 0,
    `invoiceUrl` VARCHAR(255) NULL,
    `deliveryMethod` VARCHAR(80) NULL,
    `deliveryDate` DATETIME(3) NULL,
    `internalNote` TEXT NULL,

    UNIQUE INDEX `Order_reference_key`(`reference`),
    INDEX `Order_accountId_placedAt_idx`(`accountId`, `placedAt`),
    INDEX `Order_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `OrderLine` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `productId` INTEGER NULL,
    `sku` VARCHAR(40) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `qty` INTEGER NOT NULL,
    `unitPriceHt` INTEGER NOT NULL,
    `lineTotalHt` INTEGER NOT NULL,

    INDEX `OrderLine_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Quote` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reference` VARCHAR(20) NOT NULL,
    `accountId` INTEGER NOT NULL,
    `label` VARCHAR(200) NOT NULL,
    `validUntil` DATETIME(3) NOT NULL,
    `status` ENUM('EN_COURS', 'ACCEPTE', 'EXPIRE', 'REFUSE') NOT NULL DEFAULT 'EN_COURS',
    `totalHt` INTEGER NOT NULL,
    `totalTtc` INTEGER NOT NULL,
    `pdfUrl` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `acceptedAt` DATETIME(3) NULL,
    `orderId` INTEGER NULL,

    UNIQUE INDEX `Quote_reference_key`(`reference`),
    UNIQUE INDEX `Quote_orderId_key`(`orderId`),
    INDEX `Quote_accountId_status_idx`(`accountId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `QuoteLine` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `quoteId` INTEGER NOT NULL,
    `productId` INTEGER NULL,
    `sku` VARCHAR(40) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `qty` INTEGER NOT NULL,
    `unitPriceHt` INTEGER NOT NULL,
    `lineTotalHt` INTEGER NOT NULL,

    INDEX `QuoteLine_quoteId_idx`(`quoteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cart` (
    `id` VARCHAR(36) NOT NULL,
    `accountId` INTEGER NULL,
    `updatedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CartLine` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `cartId` VARCHAR(36) NOT NULL,
    `productId` INTEGER NOT NULL,
    `qty` INTEGER NOT NULL,
    `resolvedUnitPriceHt` INTEGER NOT NULL,

    UNIQUE INDEX `CartLine_cartId_productId_key`(`cartId`, `productId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AppointmentSlot` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `startsAt` DATETIME(3) NOT NULL,
    `endsAt` DATETIME(3) NOT NULL,
    `label` VARCHAR(80) NOT NULL,
    `capacity` INTEGER NOT NULL DEFAULT 1,
    `bookedCount` INTEGER NOT NULL DEFAULT 0,
    `published` BOOLEAN NOT NULL DEFAULT true,

    INDEX `AppointmentSlot_startsAt_published_idx`(`startsAt`, `published`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Appointment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slotId` INTEGER NULL,
    `slotLabel` VARCHAR(80) NOT NULL,
    `companyName` VARCHAR(190) NOT NULL,
    `managerName` VARCHAR(160) NOT NULL,
    `phone` VARCHAR(30) NOT NULL,
    `email` VARCHAR(190) NOT NULL,
    `format` ENUM('TELEPHONE', 'VISITE', 'VISIO') NOT NULL DEFAULT 'TELEPHONE',
    `department` VARCHAR(3) NOT NULL,
    `needsText` TEXT NULL,
    `consentGiven` BOOLEAN NOT NULL DEFAULT false,
    `consentAt` DATETIME(3) NULL,
    `status` ENUM('REQUESTED', 'CONFIRMED', 'DONE', 'CANCELLED') NOT NULL DEFAULT 'REQUESTED',
    `internalNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Appointment_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupportRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `subject` ENUM('SUIVI_COMMANDE', 'FACTURE_DEVIS', 'PRODUIT_DEFECTUEUX', 'FICHE_TECHNIQUE', 'AUTRE') NOT NULL,
    `orderReference` VARCHAR(20) NULL,
    `email` VARCHAR(190) NOT NULL,
    `message` TEXT NOT NULL,
    `status` ENUM('NEW', 'IN_PROGRESS', 'ANSWERED', 'CLOSED') NOT NULL DEFAULT 'NEW',
    `internalNote` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `answeredAt` DATETIME(3) NULL,

    INDEX `SupportRequest_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DealerSearch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `query` VARCHAR(120) NOT NULL,
    `productId` INTEGER NULL,
    `results` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RegulatoryDeadline` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `label` VARCHAR(200) NOT NULL,
    `effectiveOn` DATETIME(3) NOT NULL,
    `descriptionHtml` TEXT NULL,
    `affectedMaterials` JSON NULL,
    `affectedSkus` JSON NULL,
    `articleId` INTEGER NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    INDEX `RegulatoryDeadline_effectiveOn_active_idx`(`effectiveOn`, `active`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `CookieConsent` (
    `id` VARCHAR(36) NOT NULL,
    `userId` INTEGER NULL,
    `necessary` BOOLEAN NOT NULL DEFAULT true,
    `analytics` BOOLEAN NOT NULL DEFAULT false,
    `personalisation` BOOLEAN NOT NULL DEFAULT false,
    `policyVersion` VARCHAR(20) NOT NULL,
    `decidedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ip` VARCHAR(45) NULL,

    INDEX `CookieConsent_decidedAt_idx`(`decidedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AuditLog` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `action` VARCHAR(60) NOT NULL,
    `entity` VARCHAR(60) NOT NULL,
    `entityId` VARCHAR(40) NULL,
    `payload` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `AuditLog_entity_entityId_idx`(`entity`, `entityId`),
    INDEX `AuditLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Setting` (
    `key` VARCHAR(60) NOT NULL,
    `value` TEXT NOT NULL,
    `label` VARCHAR(160) NOT NULL,
    `group` VARCHAR(40) NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`key`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_regulatoryArticleId_fkey` FOREIGN KEY (`regulatoryArticleId`) REFERENCES `Article`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_replacementProductId_fkey` FOREIGN KEY (`replacementProductId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ProductImage` ADD CONSTRAINT `ProductImage_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PriceTier` ADD CONSTRAINT `PriceTier_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResellerStock` ADD CONSTRAINT `ResellerStock_resellerId_fkey` FOREIGN KEY (`resellerId`) REFERENCES `Reseller`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResellerStock` ADD CONSTRAINT `ResellerStock_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Territory` ADD CONSTRAINT `Territory_assignedResellerId_fkey` FOREIGN KEY (`assignedResellerId`) REFERENCES `Reseller`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ResellerApplication` ADD CONSTRAINT `ResellerApplication_territoryId_fkey` FOREIGN KEY (`territoryId`) REFERENCES `Territory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Article` ADD CONSTRAINT `Article_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ArticleCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Session` ADD CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PasswordResetToken` ADD CONSTRAINT `PasswordResetToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Order` ADD CONSTRAINT `Order_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderLine` ADD CONSTRAINT `OrderLine_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrderLine` ADD CONSTRAINT `OrderLine_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Quote` ADD CONSTRAINT `Quote_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuoteLine` ADD CONSTRAINT `QuoteLine_quoteId_fkey` FOREIGN KEY (`quoteId`) REFERENCES `Quote`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `QuoteLine` ADD CONSTRAINT `QuoteLine_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Cart` ADD CONSTRAINT `Cart_accountId_fkey` FOREIGN KEY (`accountId`) REFERENCES `Account`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartLine` ADD CONSTRAINT `CartLine_cartId_fkey` FOREIGN KEY (`cartId`) REFERENCES `Cart`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CartLine` ADD CONSTRAINT `CartLine_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Appointment` ADD CONSTRAINT `Appointment_slotId_fkey` FOREIGN KEY (`slotId`) REFERENCES `AppointmentSlot`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
