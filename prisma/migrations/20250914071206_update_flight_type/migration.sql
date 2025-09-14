/*
  Warnings:

  - You are about to drop the column `maxCapacity` on the `Flight` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Flight` DROP COLUMN `maxCapacity`,
    ADD COLUMN `cancellationReason` VARCHAR(255) NULL,
    ADD COLUMN `delayReason` VARCHAR(255) NULL;
