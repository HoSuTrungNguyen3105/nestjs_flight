/*
  Warnings:

  - The `createdAt` column on the `UserSession` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE `UserSession` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DECIMAL(20, 3) NULL;
