/*
  Warnings:

  - You are about to drop the column `terminal` on the `Flight` table. All the data in the column will be lost.
  - You are about to alter the column `flightType` on the `Flight` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `Enum(EnumId(10))`.

*/
-- AlterTable
ALTER TABLE `Flight` DROP COLUMN `terminal`,
    ADD COLUMN `isDomestic` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `flightType` ENUM('roundtrip', 'oneway') NOT NULL DEFAULT 'oneway';

-- AlterTable
ALTER TABLE `User` ADD COLUMN `isDeleted` BOOLEAN NOT NULL DEFAULT false;
