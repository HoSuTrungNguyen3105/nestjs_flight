/*
  Warnings:

  - You are about to drop the column `column` on the `Seat` table. All the data in the column will be lost.
  - You are about to drop the column `row` on the `Seat` table. All the data in the column will be lost.
  - You are about to alter the column `rank` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(1))`.
  - You are about to alter the column `department` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - You are about to alter the column `position` on the `User` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(3))`.
  - Added the required column `seatNumber` to the `Seat` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seatRow` to the `Seat` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Seat` DROP COLUMN `column`,
    DROP COLUMN `row`,
    ADD COLUMN `seatNumber` INTEGER NOT NULL,
    ADD COLUMN `seatRow` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `rank` ENUM('JUNIOR', 'MID', 'SENIOR', 'LEAD', 'PRINCIPAL', 'NONE') NOT NULL DEFAULT 'NONE',
    MODIFY `department` ENUM('HR', 'IT', 'FINANCE', 'OPS', 'SECURITY', 'OTHER') NULL,
    MODIFY `position` ENUM('INTERN', 'STAFF', 'SENIOR', 'MANAGER', 'DIRECTOR', 'EXECUTIVE') NULL;
