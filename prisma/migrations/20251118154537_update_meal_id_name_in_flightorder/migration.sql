/*
  Warnings:

  - You are about to drop the column `mealId` on the `MealOrder` table. All the data in the column will be lost.
  - Added the required column `flightMealId` to the `MealOrder` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `MealOrder` DROP FOREIGN KEY `MealOrder_mealId_fkey`;

-- DropIndex
DROP INDEX `MealOrder_mealId_fkey` ON `MealOrder`;

-- AlterTable
ALTER TABLE `MealOrder` DROP COLUMN `mealId`,
    ADD COLUMN `flightMealId` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `MealOrder_flightMealId_fkey` ON `MealOrder`(`flightMealId`);

-- AddForeignKey
ALTER TABLE `MealOrder` ADD CONSTRAINT `MealOrder_flightMealId_fkey` FOREIGN KEY (`flightMealId`) REFERENCES `FlightMeal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
