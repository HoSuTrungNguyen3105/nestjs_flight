/*
  Warnings:

  - You are about to drop the column `cancellationReason` on the `Flight` table. All the data in the column will be lost.
  - You are about to drop the column `delayMinutes` on the `Flight` table. All the data in the column will be lost.
  - You are about to drop the column `delayReason` on the `Flight` table. All the data in the column will be lost.
  - You are about to drop the column `isCancelled` on the `Flight` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Flight` DROP COLUMN `cancellationReason`,
    DROP COLUMN `delayMinutes`,
    DROP COLUMN `delayReason`,
    DROP COLUMN `isCancelled`;
