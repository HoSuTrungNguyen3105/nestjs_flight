/*
  Warnings:

  - The values [USER] on the enum `Passenger_role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to alter the column `role` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(6))` to `Enum(EnumId(8))`.

*/
-- AlterTable
ALTER TABLE `Passenger` MODIFY `role` ENUM('PASSENGER', 'ADMIN', 'MONITOR') NOT NULL DEFAULT 'PASSENGER';

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('PASSENGER', 'ADMIN', 'MONITOR') NOT NULL DEFAULT 'ADMIN';

-- CreateTable
CREATE TABLE `RolePermission` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `role` ENUM('PASSENGER', 'ADMIN', 'MONITOR') NOT NULL,
    `permissions` JSON NOT NULL,
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `updatedAt` DECIMAL(20, 3) NOT NULL,

    UNIQUE INDEX `RolePermission_role_key`(`role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
