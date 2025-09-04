/*
  Warnings:

  - You are about to drop the `Passenger` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Booking` DROP FOREIGN KEY `Booking_passengerId_fkey`;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `passport` VARCHAR(191) NOT NULL DEFAULT '',
    ADD COLUMN `phone` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `userAlias` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `mfaSecretKey` VARCHAR(191) NULL DEFAULT '';

-- DropTable
DROP TABLE `Passenger`;
