-- CreateTable
CREATE TABLE `Payment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `amount` DECIMAL(20, 3) NOT NULL,
    `currency` VARCHAR(191) NOT NULL DEFAULT 'VND',
    `method` ENUM('MOMO', 'ZALOPAY', 'STRIPE') NOT NULL,
    `status` ENUM('PENDING', 'SUCCESS', 'FAILED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `transactionId` VARCHAR(191) NULL,
    `paymentUrl` VARCHAR(191) NULL,
    `createdAt` DECIMAL(20, 3) NOT NULL DEFAULT (UNIX_TIMESTAMP()*1000),
    `updatedAt` DECIMAL(20, 3) NOT NULL DEFAULT (UNIX_TIMESTAMP()*1000),

    UNIQUE INDEX `Payment_transactionId_key`(`transactionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
