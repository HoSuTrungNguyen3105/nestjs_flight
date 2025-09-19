/*
  Warnings:

  - You are about to drop the column `coordinates` on the `Airport` table. All the data in the column will be lost.
  - You are about to drop the column `timezone` on the `Airport` table. All the data in the column will be lost.
  - You are about to drop the column `gate` on the `Flight` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gateId]` on the table `Flight` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `country` to the `Airport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdAt` to the `Airport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `airline` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `destination` to the `Flight` table without a default value. This is not possible if the table is not empty.
  - Added the required column `origin` to the `Flight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Airport` DROP COLUMN `coordinates`,
    DROP COLUMN `timezone`,
    ADD COLUMN `country` VARCHAR(191) NOT NULL,
    ADD COLUMN `createdAt` DECIMAL(20, 3) NOT NULL,
    ADD COLUMN `updatedAt` DECIMAL(20, 3) NULL;

-- AlterTable
ALTER TABLE `Flight` DROP COLUMN `gate`,
    ADD COLUMN `airline` VARCHAR(191) NOT NULL,
    ADD COLUMN `destination` VARCHAR(191) NOT NULL,
    ADD COLUMN `gateId` VARCHAR(191) NULL,
    ADD COLUMN `origin` VARCHAR(191) NOT NULL;

-- CreateTable
CREATE TABLE `Terminal` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `type` ENUM('INTERNATIONAL', 'DOMESTIC', 'BUSINESS') NOT NULL,
    `airportId` VARCHAR(191) NOT NULL,
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `updatedAt` DECIMAL(20, 3) NOT NULL,

    UNIQUE INDEX `Terminal_airportId_code_key`(`airportId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Facility` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('RESTAURANT', 'SHOP', 'LOUNGE', 'INFORMATION', 'SECURITY', 'TRANSPORTATION', 'OTHER') NOT NULL,
    `description` VARCHAR(191) NULL,
    `terminalId` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `openingHours` VARCHAR(191) NULL,
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `updatedAt` DECIMAL(20, 3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GateAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `gateId` VARCHAR(191) NOT NULL,
    `flightId` INTEGER NOT NULL,
    `assignedAt` DECIMAL(20, 3) NOT NULL,
    `releasedAt` DECIMAL(20, 3) NOT NULL,
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `updatedAt` DECIMAL(20, 3) NOT NULL,

    UNIQUE INDEX `GateAssignment_gateId_flightId_key`(`gateId`, `flightId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gate` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `terminalId` VARCHAR(191) NOT NULL,
    `status` ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLOSED') NOT NULL DEFAULT 'AVAILABLE',
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `updatedAt` DECIMAL(20, 3) NOT NULL,

    UNIQUE INDEX `Gate_terminalId_code_key`(`terminalId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Flight_gateId_key` ON `Flight`(`gateId`);

-- CreateIndex
CREATE INDEX `Flight_gateId_idx` ON `Flight`(`gateId`);

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_gateId_fkey` FOREIGN KEY (`gateId`) REFERENCES `Gate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Terminal` ADD CONSTRAINT `Terminal_airportId_fkey` FOREIGN KEY (`airportId`) REFERENCES `Airport`(`code`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Facility` ADD CONSTRAINT `Facility_terminalId_fkey` FOREIGN KEY (`terminalId`) REFERENCES `Terminal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GateAssignment` ADD CONSTRAINT `GateAssignment_gateId_fkey` FOREIGN KEY (`gateId`) REFERENCES `Gate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GateAssignment` ADD CONSTRAINT `GateAssignment_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`flightId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gate` ADD CONSTRAINT `Gate_terminalId_fkey` FOREIGN KEY (`terminalId`) REFERENCES `Terminal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
