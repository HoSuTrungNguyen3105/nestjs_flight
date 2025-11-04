-- CreateTable
CREATE TABLE `Hotel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `rating` DOUBLE NOT NULL,
    `reviewCount` INTEGER NOT NULL DEFAULT 0,
    `distanceToCenter` DOUBLE NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `discountPercent` DOUBLE NULL,
    `isPrime` BOOLEAN NOT NULL DEFAULT false,
    `freeWifi` BOOLEAN NOT NULL DEFAULT false,
    `covidMeasures` BOOLEAN NOT NULL DEFAULT false,
    `freeCancel` BOOLEAN NOT NULL DEFAULT false,
    `payLater` BOOLEAN NOT NULL DEFAULT false,
    `rooms` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `updatedAt` DECIMAL(20, 3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
