/*
  Warnings:

  - Added the required column `password` to the `Passenger` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Passenger` ADD COLUMN `accountLockYn` VARCHAR(191) NOT NULL DEFAULT 'N',
    ADD COLUMN `authType` VARCHAR(191) NOT NULL DEFAULT 'ID,PW',
    ADD COLUMN `isEmailVerified` VARCHAR(191) NOT NULL DEFAULT 'N',
    ADD COLUMN `lastLoginDate` DECIMAL(20, 3) NULL,
    ADD COLUMN `loginFailCnt` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `mfaEnabledYn` VARCHAR(191) NOT NULL DEFAULT 'N',
    ADD COLUMN `mfaSecretKey` VARCHAR(191) NULL,
    ADD COLUMN `password` VARCHAR(100) NOT NULL,
    ADD COLUMN `prevPassword` VARCHAR(191) NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE `UnlockRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `reason` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `approvedAt` DECIMAL(20, 3) NULL,

    INDEX `UnlockRequest_userId_fkey`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UnlockRequest` ADD CONSTRAINT `UnlockRequest_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
