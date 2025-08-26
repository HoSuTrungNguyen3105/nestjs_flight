/*
  Warnings:

  - The values [ID,PW] on the enum `Passenger_authType` will be removed. If these variants are still used in the database, this will fail.
  - The `createdAt` column on the `Passenger` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `updatedAt` column on the `Passenger` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `status` on the `UnlockRequest` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `Passenger` MODIFY `authType` ENUM('ID,PW', 'MFA', 'GMAIL') NOT NULL DEFAULT 'ID,PW',
    DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DECIMAL(20, 3) NULL,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DECIMAL(20, 3) NULL;

-- AlterTable
ALTER TABLE `UnlockRequest` MODIFY `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';
