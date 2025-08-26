/*
  Warnings:

  - You are about to alter the column `authType` on the `Passenger` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - Added the required column `updatedAt` to the `Passenger` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Passenger` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `authType` ENUM('ID,PW', 'MFA', 'GMAIL') NOT NULL DEFAULT 'ID,PW';
