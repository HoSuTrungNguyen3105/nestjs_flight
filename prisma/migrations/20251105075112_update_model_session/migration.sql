-- DropForeignKey
ALTER TABLE `UserSession` DROP FOREIGN KEY `UserSession_userId_fkey`;

-- AlterTable
ALTER TABLE `Ticket` ADD COLUMN `seatPrice` DECIMAL(10, 2) NULL;

-- AlterTable
ALTER TABLE `UserSession` ADD COLUMN `browser` VARCHAR(191) NULL,
    ADD COLUMN `device` VARCHAR(191) NULL,
    ADD COLUMN `ipAddress` VARCHAR(191) NULL,
    ADD COLUMN `isCurrent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `location` VARCHAR(191) NULL,
    ADD COLUMN `userAgent` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `UserSession` ADD CONSTRAINT `UserSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
