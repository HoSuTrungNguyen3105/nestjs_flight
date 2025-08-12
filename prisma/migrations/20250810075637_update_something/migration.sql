/*
  Warnings:

  - You are about to drop the column `accountLocked` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `loginFailCount` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mfaEnabled` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `mfaSecret` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `accountLocked`,
    DROP COLUMN `lastLoginAt`,
    DROP COLUMN `loginFailCount`,
    DROP COLUMN `mfaEnabled`,
    DROP COLUMN `mfaSecret`,
    ADD COLUMN `accountLockYn` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `lastLoginDate` DECIMAL(20, 0) NULL,
    ADD COLUMN `loginFailCnt` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `mfaEnabledYn` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `mfaSecretKey` VARCHAR(191) NULL;
