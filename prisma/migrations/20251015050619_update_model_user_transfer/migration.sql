-- AlterTable
ALTER TABLE `User` ADD COLUMN `fromTransferAdminUserYn` VARCHAR(191) NULL DEFAULT 'N',
    ADD COLUMN `toTransferAdminUserYn` VARCHAR(191) NULL DEFAULT 'N';
