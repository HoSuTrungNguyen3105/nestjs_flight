/*
  Warnings:

  - You are about to drop the column `mealCode` on the `FlightMeal` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[flightMealCode]` on the table `FlightMeal` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mealCode]` on the table `Meal` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `FlightMeal_mealCode_key` ON `FlightMeal`;

-- AlterTable
ALTER TABLE `FlightMeal` DROP COLUMN `mealCode`,
    ADD COLUMN `flightMealCode` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Meal` ADD COLUMN `mealCode` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `FlightMeal_flightMealCode_key` ON `FlightMeal`(`flightMealCode`);

-- CreateIndex
CREATE UNIQUE INDEX `Meal_mealCode_key` ON `Meal`(`mealCode`);
