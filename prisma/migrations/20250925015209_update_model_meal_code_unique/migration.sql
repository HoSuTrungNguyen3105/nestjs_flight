/*
  Warnings:

  - A unique constraint covering the columns `[mealCode]` on the table `Meal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Meal_mealCode_key` ON `Meal`(`mealCode`);
