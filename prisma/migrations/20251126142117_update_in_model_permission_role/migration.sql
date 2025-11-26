/*
  Warnings:

  - You are about to drop the column `passengerId` on the `RolePermission` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `RolePermission` table. All the data in the column will be lost.
  - You are about to drop the `UserPermission` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `RolePermission` DROP FOREIGN KEY `RolePermission_passengerId_fkey`;

-- DropForeignKey
ALTER TABLE `RolePermission` DROP FOREIGN KEY `RolePermission_userId_fkey`;

-- DropForeignKey
ALTER TABLE `UserPermission` DROP FOREIGN KEY `UserPermission_passengerId_fkey`;

-- DropForeignKey
ALTER TABLE `UserPermission` DROP FOREIGN KEY `UserPermission_userId_fkey`;

-- AlterTable
ALTER TABLE `RolePermission` DROP COLUMN `passengerId`,
    DROP COLUMN `userId`;

-- DropTable
DROP TABLE `UserPermission`;
