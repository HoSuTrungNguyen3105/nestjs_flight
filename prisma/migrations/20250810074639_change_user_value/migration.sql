/*
  Warnings:

  - You are about to drop the column `accountLockYn` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `approvalTransferAdminDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `approvalTransferAdminYn` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `firstname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fromTransferAdminUserId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `fromTransferAdminUserYn` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `loginFailCnt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mfaEnabledYn` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mfaSecretKey` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `requestTransferAdminDate` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `toTransferAdminUserId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `touTransferAdminUserYn` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `userAlias` on the `User` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `accountLockYn`,
    DROP COLUMN `approvalTransferAdminDate`,
    DROP COLUMN `approvalTransferAdminYn`,
    DROP COLUMN `firstname`,
    DROP COLUMN `fromTransferAdminUserId`,
    DROP COLUMN `fromTransferAdminUserYn`,
    DROP COLUMN `lastLoginDate`,
    DROP COLUMN `lastname`,
    DROP COLUMN `loginFailCnt`,
    DROP COLUMN `mfaEnabledYn`,
    DROP COLUMN `mfaSecretKey`,
    DROP COLUMN `requestTransferAdminDate`,
    DROP COLUMN `toTransferAdminUserId`,
    DROP COLUMN `touTransferAdminUserYn`,
    DROP COLUMN `userAlias`,
    ADD COLUMN `accountLocked` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lastLoginAt` DATETIME(3) NULL,
    ADD COLUMN `loginFailCount` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `mfaEnabled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `mfaSecret` VARCHAR(191) NULL,
    ADD COLUMN `transferAdminId` INTEGER NULL,
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- CreateTable
CREATE TABLE `TransferAdmin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `fromUserId` INTEGER NOT NULL,
    `toUserId` INTEGER NOT NULL,
    `requestedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `approvedAt` DATETIME(3) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',

    UNIQUE INDEX `TransferAdmin_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TransferAdmin` ADD CONSTRAINT `TransferAdmin_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
