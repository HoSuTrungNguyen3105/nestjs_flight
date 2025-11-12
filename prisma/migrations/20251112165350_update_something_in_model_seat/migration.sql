/*
  Warnings:

  - You are about to drop the column `bookingId` on the `Seat` table. All the data in the column will be lost.
  - Added the required column `seatId` to the `Booking` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Seat` DROP FOREIGN KEY `Seat_bookingId_fkey`;

-- DropIndex
DROP INDEX `Seat_bookingId_key` ON `Seat`;

-- AlterTable
ALTER TABLE `Booking` ADD COLUMN `seatId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Seat` DROP COLUMN `bookingId`;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_seatId_fkey` FOREIGN KEY (`seatId`) REFERENCES `Seat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
