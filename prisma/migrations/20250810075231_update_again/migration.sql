/*
  Warnings:

  - The `lastLoginAt` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `userAlias` to the `User` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `createdAt` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `User` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `userAlias` VARCHAR(191) NOT NULL,
    DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DECIMAL(20, 0) NOT NULL,
    DROP COLUMN `lastLoginAt`,
    ADD COLUMN `lastLoginAt` DECIMAL(20, 0) NULL,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DECIMAL(20, 0) NOT NULL;
