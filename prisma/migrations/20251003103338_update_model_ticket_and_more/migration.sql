/*
  Warnings:

  - You are about to drop the column `userId` on the `UnlockRequest` table. All the data in the column will be lost.
  - Added the required column `employeeId` to the `UnlockRequest` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `UnlockRequest` DROP FOREIGN KEY `UnlockRequest_userId_fkey`;

-- DropIndex
DROP INDEX `UnlockRequest_userId_fkey` ON `UnlockRequest`;

-- AlterTable
ALTER TABLE `UnlockRequest` DROP COLUMN `userId`,
    ADD COLUMN `employeeId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Ticket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketNo` VARCHAR(191) NOT NULL,
    `passengerId` VARCHAR(191) NOT NULL,
    `flightId` INTEGER NOT NULL,
    `seatClass` VARCHAR(20) NOT NULL,
    `seatNo` VARCHAR(10) NOT NULL,
    `bookedAt` DECIMAL(20, 3) NOT NULL,

    UNIQUE INDEX `Ticket_ticketNo_key`(`ticketNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoardingPass` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `issuedAt` DECIMAL(20, 3) NOT NULL,
    `gate` VARCHAR(10) NOT NULL,
    `boardingTime` DECIMAL(20, 3) NOT NULL,
    `flightId` INTEGER NOT NULL,

    UNIQUE INDEX `BoardingPass_ticketId_key`(`ticketId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Baggage` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `flightId` INTEGER NOT NULL,
    `weight` DOUBLE NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `checkedAt` DECIMAL(20, 3) NOT NULL,
    `ticketId` INTEGER NOT NULL,

    UNIQUE INDEX `Baggage_ticketId_key`(`ticketId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `UnlockRequest_employeeId_fkey` ON `UnlockRequest`(`employeeId`);

-- AddForeignKey
ALTER TABLE `UnlockRequest` ADD CONSTRAINT `UnlockRequest_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_passengerId_fkey` FOREIGN KEY (`passengerId`) REFERENCES `Passenger`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoardingPass` ADD CONSTRAINT `BoardingPass_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoardingPass` ADD CONSTRAINT `BoardingPass_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Baggage` ADD CONSTRAINT `Baggage_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Baggage` ADD CONSTRAINT `Baggage_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
