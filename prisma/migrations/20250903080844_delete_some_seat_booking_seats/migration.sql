/*
  Warnings:

  - You are about to drop the column `seat` on the `Booking` table. All the data in the column will be lost.
  - The values [ID,PW] on the enum `Passenger_authType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `seat`;

-- AlterTable
ALTER TABLE `Passenger` MODIFY `authType` ENUM('ID,PW', 'MFA', 'GMAIL') NOT NULL DEFAULT 'ID,PW';
