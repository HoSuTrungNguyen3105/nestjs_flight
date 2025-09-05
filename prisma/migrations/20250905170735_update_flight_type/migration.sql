/*
  Warnings:

  - Added the required column `flightType` to the `Flight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Flight` ADD COLUMN `delayMinutes` INTEGER NULL,
    ADD COLUMN `flightType` VARCHAR(10) NOT NULL,
    ADD COLUMN `gate` VARCHAR(191) NULL,
    ADD COLUMN `isCancelled` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `maxCapacity` INTEGER NULL,
    ADD COLUMN `priceBusiness` DOUBLE NULL,
    ADD COLUMN `priceEconomy` DOUBLE NULL,
    ADD COLUMN `priceFirst` DOUBLE NULL,
    ADD COLUMN `terminal` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Seat` ADD COLUMN `type` ENUM('VIP', 'BUSINESS', 'ECONOMY') NOT NULL DEFAULT 'ECONOMY';
