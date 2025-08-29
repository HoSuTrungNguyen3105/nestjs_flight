/*
  Warnings:

  - The values [ID,PW] on the enum `Passenger_authType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `transferAdminId` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Passenger` MODIFY `authType` ENUM('ID,PW', 'MFA', 'GMAIL') NOT NULL DEFAULT 'ID,PW';

-- AlterTable
ALTER TABLE `User` DROP COLUMN `transferAdminId`,
    ADD COLUMN `resetToken` VARCHAR(191) NULL;
