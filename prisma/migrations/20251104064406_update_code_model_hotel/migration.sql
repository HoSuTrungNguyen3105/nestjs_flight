/*
  Warnings:

  - A unique constraint covering the columns `[hotelCode]` on the table `Hotel` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Hotel` ADD COLUMN `hotelCode` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Hotel_hotelCode_key` ON `Hotel`(`hotelCode`);
