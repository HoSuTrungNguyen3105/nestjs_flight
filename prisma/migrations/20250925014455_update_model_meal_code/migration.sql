/*
  Warnings:

  - You are about to alter the column `mealType` on the `Meal` table. The data in that column could be lost. The data in that column will be cast from `VarChar(50)` to `Enum(EnumId(14))`.
  - Added the required column `mealCode` to the `Meal` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Meal` ADD COLUMN `mealCode` VARCHAR(191) NOT NULL,
    MODIFY `mealType` ENUM('VEG', 'NONVEG', 'DRINK', 'DESSERT') NOT NULL;
