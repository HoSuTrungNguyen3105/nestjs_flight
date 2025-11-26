-- AlterTable
ALTER TABLE `RolePermission` ADD COLUMN `passengerId` VARCHAR(191) NULL,
    ADD COLUMN `userId` INTEGER NULL;

-- CreateTable
CREATE TABLE `UserPermission` (
    `id` VARCHAR(191) NOT NULL,
    `userId` INTEGER NULL,
    `passengerId` VARCHAR(191) NULL,
    `permissions` JSON NOT NULL,
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `updatedAt` DECIMAL(20, 3) NOT NULL,

    UNIQUE INDEX `UserPermission_userId_key`(`userId`),
    UNIQUE INDEX `UserPermission_passengerId_key`(`passengerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RolePermission` ADD CONSTRAINT `RolePermission_passengerId_fkey` FOREIGN KEY (`passengerId`) REFERENCES `Passenger`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPermission` ADD CONSTRAINT `UserPermission_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserPermission` ADD CONSTRAINT `UserPermission_passengerId_fkey` FOREIGN KEY (`passengerId`) REFERENCES `Passenger`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
