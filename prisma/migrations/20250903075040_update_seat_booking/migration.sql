/*
  Warnings:

  - The values [ID,PW] on the enum `Passenger_authType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Passenger` MODIFY `authType` ENUM('ID,PW', 'MFA', 'GMAIL') NOT NULL DEFAULT 'ID,PW';

-- CreateTable
CREATE TABLE `Seat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `row` INTEGER NOT NULL,
    `column` VARCHAR(191) NOT NULL,
    `isBooked` BOOLEAN NOT NULL DEFAULT false,
    `flightId` INTEGER NOT NULL,
    `bookingId` INTEGER NULL,

    UNIQUE INDEX `Seat_bookingId_key`(`bookingId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Seat` ADD CONSTRAINT `Seat_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Seat` ADD CONSTRAINT `Seat_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
