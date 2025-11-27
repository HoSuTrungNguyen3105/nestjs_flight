-- CreateTable
CREATE TABLE `PermissionDefinition` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `key` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `action` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `updatedAt` DECIMAL(20, 3) NOT NULL,

    UNIQUE INDEX `PermissionDefinition_key_key`(`key`),
    INDEX `PermissionDefinition_category_idx`(`category`),
    INDEX `PermissionDefinition_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
