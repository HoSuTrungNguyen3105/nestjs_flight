/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Terminal` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Terminal_code_key` ON `Terminal`(`code`);
