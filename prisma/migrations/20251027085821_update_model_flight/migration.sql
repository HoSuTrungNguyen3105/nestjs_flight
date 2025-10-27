/*
  Warnings:

  - You are about to drop the column `status` on the `Flight` table. All the data in the column will be lost.
  - You are about to alter the column `status` on the `FlightStatus` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `Enum(EnumId(15))`.

*/
-- AlterTable
ALTER TABLE `Flight` DROP COLUMN `status`;

-- AlterTable
ALTER TABLE `FlightStatus` MODIFY `status` ENUM('SCHEDULED', 'BOARDING', 'LANDED', 'DELAYED', 'DEPARTED', 'ARRIVED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED';
