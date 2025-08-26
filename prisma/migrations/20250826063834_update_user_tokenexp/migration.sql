/*
  Warnings:

  - The values [ID,PW] on the enum `Passenger_authType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Passenger` MODIFY `authType` ENUM('ID,PW', 'MFA', 'GMAIL') NOT NULL DEFAULT 'ID,PW';

-- AlterTable
ALTER TABLE `User` ADD COLUMN `resetTokenExpires` DECIMAL(20, 3) NULL;
