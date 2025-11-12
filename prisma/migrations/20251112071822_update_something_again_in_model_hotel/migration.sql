-- AlterTable
ALTER TABLE `Hotel` ADD COLUMN `externalId` VARCHAR(191) NULL,
    ADD COLUMN `externalSource` VARCHAR(191) NULL,
    ADD COLUMN `isImported` BOOLEAN NOT NULL DEFAULT false;
