/*
  Warnings:

  - You are about to drop the column `mealCode` on the `Meal` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[mealCode]` on the table `FlightMeal` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Meal_mealCode_key` ON `Meal`;

-- AlterTable
ALTER TABLE `FlightMeal` ADD COLUMN `mealCode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Meal` DROP COLUMN `mealCode`;

-- CreateIndex
CREATE UNIQUE INDEX `FlightMeal_mealCode_key` ON `FlightMeal`(`mealCode`);
