/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Gate` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Gate_code_key` ON `Gate`(`code`);
