/*
  Warnings:

  - You are about to alter the column `isEmailVerified` on the `User` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.
  - You are about to alter the column `accountLockYn` on the `User` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.
  - You are about to alter the column `mfaEnabledYn` on the `User` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `User` MODIFY `isEmailVerified` VARCHAR(191) NOT NULL DEFAULT 'N',
    MODIFY `accountLockYn` VARCHAR(191) NOT NULL DEFAULT 'N',
    MODIFY `mfaEnabledYn` VARCHAR(191) NOT NULL DEFAULT 'N';
