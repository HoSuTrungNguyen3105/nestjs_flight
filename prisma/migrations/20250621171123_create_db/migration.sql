-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `password` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Flight` (
    `flightId` INTEGER NOT NULL AUTO_INCREMENT,
    `flightNo` VARCHAR(10) NULL,
    `scheduledDeparture` DATETIME(3) NOT NULL,
    `scheduledArrival` DATETIME(3) NOT NULL,
    `departureAirport` VARCHAR(10) NOT NULL,
    `arrivalAirport` VARCHAR(10) NOT NULL,
    `status` VARCHAR(20) NOT NULL,
    `aircraftCode` VARCHAR(10) NOT NULL,
    `actualDeparture` DATETIME(3) NULL,
    `actualArrival` DATETIME(3) NULL,

    PRIMARY KEY (`flightId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
