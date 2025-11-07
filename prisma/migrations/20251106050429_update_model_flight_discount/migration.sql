/*
  Warnings:

  - Added the required column `validFrom` to the `DiscountCode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `validTo` to the `DiscountCode` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `createdAt` on the `DiscountCode` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `DiscountCode` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `createdAt` on the `FlightDiscount` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE `DiscountCode` DROP COLUMN `validFrom`,
    ADD COLUMN `validFrom` DECIMAL(20, 3) NOT NULL,
    DROP COLUMN `validTo`,
    ADD COLUMN `validTo` DECIMAL(20, 3) NOT NULL,
    DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DECIMAL(20, 3) NOT NULL,
    DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DECIMAL(20, 3) NOT NULL;

-- AlterTable
ALTER TABLE `FlightDiscount` DROP COLUMN `createdAt`,
    ADD COLUMN `createdAt` DECIMAL(20, 3) NOT NULL;
