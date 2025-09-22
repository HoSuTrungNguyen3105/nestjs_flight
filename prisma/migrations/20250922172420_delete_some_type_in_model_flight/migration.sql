/*
  Warnings:

  - You are about to drop the column `airline` on the `Flight` table. All the data in the column will be lost.
  - You are about to drop the column `destination` on the `Flight` table. All the data in the column will be lost.
  - You are about to drop the column `origin` on the `Flight` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Flight` DROP COLUMN `airline`,
    DROP COLUMN `destination`,
    DROP COLUMN `origin`;
