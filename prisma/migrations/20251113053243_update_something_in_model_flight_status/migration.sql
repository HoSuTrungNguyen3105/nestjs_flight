/*
  Warnings:

  - The values [LANDED] on the enum `FlightStatus_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `FlightStatus` MODIFY `status` ENUM('SCHEDULED', 'BOARDING', 'DELAYED', 'DEPARTED', 'ARRIVED', 'CANCELLED', 'IN_AIR', 'COMPLETED') NOT NULL DEFAULT 'SCHEDULED';
