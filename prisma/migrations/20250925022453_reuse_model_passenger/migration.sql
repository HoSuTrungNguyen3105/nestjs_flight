/*
  Warnings:

  - You are about to drop the column `passport` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `TransferAdmin` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `TransferAdmin` DROP FOREIGN KEY `TransferAdmin_userId_fkey`;

-- AlterTable
ALTER TABLE `Booking` MODIFY `passengerId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `passport`;

-- DropTable
DROP TABLE `TransferAdmin`;

-- CreateTable
CREATE TABLE `Passenger` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `passport` VARCHAR(191) NOT NULL,
    `accountLockYn` VARCHAR(191) NOT NULL DEFAULT 'N',
    `isEmailVerified` VARCHAR(191) NOT NULL DEFAULT 'Y',
    `lastLoginDate` DECIMAL(20, 3) NULL,

    UNIQUE INDEX `Passenger_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_passengerId_fkey` FOREIGN KEY (`passengerId`) REFERENCES `Passenger`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
