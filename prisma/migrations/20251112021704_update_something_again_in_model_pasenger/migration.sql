-- CreateTable
CREATE TABLE `HotelReview` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `passengerId` VARCHAR(191) NOT NULL,
    `hotelId` INTEGER NOT NULL,
    `rating` DOUBLE NOT NULL,
    `comment` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `HotelReview` ADD CONSTRAINT `HotelReview_passengerId_fkey` FOREIGN KEY (`passengerId`) REFERENCES `Passenger`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `HotelReview` ADD CONSTRAINT `HotelReview_hotelId_fkey` FOREIGN KEY (`hotelId`) REFERENCES `Hotel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
