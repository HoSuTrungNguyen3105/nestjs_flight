-- AlterTable
ALTER TABLE `UserSession` MODIFY `userId` INTEGER NULL;

-- CreateTable
CREATE TABLE `FlightDiscount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `discountCodeId` INTEGER NOT NULL,
    `flightId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `FlightDiscount_discountCodeId_flightId_key`(`discountCodeId`, `flightId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiscountCode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `discountAmount` DECIMAL(65, 30) NULL,
    `discountPercent` INTEGER NULL,
    `isPercentage` BOOLEAN NOT NULL DEFAULT false,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `validFrom` DATETIME(3) NULL,
    `validTo` DATETIME(3) NULL,
    `usageLimit` INTEGER NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `DiscountCode_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FlightDiscount` ADD CONSTRAINT `FlightDiscount_discountCodeId_fkey` FOREIGN KEY (`discountCodeId`) REFERENCES `DiscountCode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlightDiscount` ADD CONSTRAINT `FlightDiscount_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;
