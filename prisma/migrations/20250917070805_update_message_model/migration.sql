/*
  Warnings:

  - Changed the type of `createdAt` on the `messages` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE `messages` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DECIMAL(20, 3) NOT NULL;
