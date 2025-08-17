/*
  Warnings:

  - A unique constraint covering the columns `[flightNo]` on the table `Flight` will be added. If there are existing duplicate values, this will fail.
  - Made the column `flightNo` on table `Flight` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `Flight` MODIFY `flightNo` VARCHAR(10) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Flight_flightNo_key` ON `Flight`(`flightNo`);
