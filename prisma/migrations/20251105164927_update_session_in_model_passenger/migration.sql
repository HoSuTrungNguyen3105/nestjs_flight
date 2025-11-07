-- AlterTable
ALTER TABLE `UserSession` ADD COLUMN `passengerId` VARCHAR(191) NULL;

-- CreateIndex
CREATE INDEX `UserSession_passengerId_fkey` ON `UserSession`(`passengerId`);

-- AddForeignKey
ALTER TABLE `UserSession` ADD CONSTRAINT `UserSession_passengerId_fkey` FOREIGN KEY (`passengerId`) REFERENCES `Passenger`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
