/*
  Warnings:

  - Made the column `isAvailable` on table `Seat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isExitRow` on table `Seat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `isExtraLegroom` on table `Seat` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Seat` ADD COLUMN `isHandicapAccessible` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isNearLavatory` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isUpperDeck` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `isWing` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `isExitRow` BOOLEAN NOT NULL DEFAULT false,
    MODIFY `isExtraLegroom` BOOLEAN NOT NULL DEFAULT false;
