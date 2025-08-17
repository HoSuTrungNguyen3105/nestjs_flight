/*
  Warnings:

  - The `actualDeparture` column on the `Flight` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `actualArrival` column on the `Flight` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `createdAt` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,0)` to `Decimal(20,3)`.
  - You are about to alter the column `updatedAt` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,0)` to `Decimal(20,3)`.
  - You are about to alter the column `lastLoginDate` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Decimal(20,0)` to `Decimal(20,3)`.
  - Changed the type of `bookingTime` on the `Booking` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `scheduledDeparture` on the `Flight` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `scheduledArrival` on the `Flight` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `updatedAt` on the `FlightStatus` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `requestedAt` on the `TransferAdmin` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `approvedAt` to the `TransferAdmin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Booking` DROP COLUMN `bookingTime`,
    ADD COLUMN `bookingTime` DECIMAL(20, 3) NOT NULL;

-- AlterTable
ALTER TABLE `Flight` DROP COLUMN `scheduledDeparture`,
    ADD COLUMN `scheduledDeparture` DECIMAL(20, 3) NOT NULL,
    DROP COLUMN `scheduledArrival`,
    ADD COLUMN `scheduledArrival` DECIMAL(20, 3) NOT NULL,
    DROP COLUMN `actualDeparture`,
    ADD COLUMN `actualDeparture` DECIMAL(20, 3) NULL,
    DROP COLUMN `actualArrival`,
    ADD COLUMN `actualArrival` DECIMAL(20, 3) NULL;

-- AlterTable
ALTER TABLE `FlightStatus` DROP COLUMN `updatedAt`,
    ADD COLUMN `updatedAt` DECIMAL(20, 3) NOT NULL;

-- AlterTable
ALTER TABLE `TransferAdmin` DROP COLUMN `requestedAt`,
    ADD COLUMN `requestedAt` DECIMAL(20, 3) NOT NULL,
    DROP COLUMN `approvedAt`,
    ADD COLUMN `approvedAt` DECIMAL(20, 3) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `createdAt` DECIMAL(20, 3) NOT NULL,
    MODIFY `updatedAt` DECIMAL(20, 3) NOT NULL,
    MODIFY `lastLoginDate` DECIMAL(20, 3) NULL;
