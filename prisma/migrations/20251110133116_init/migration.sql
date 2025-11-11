-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(50) NOT NULL,
    `role` ENUM('PASSENGER', 'USER', 'ADMIN', 'MONITOR') NOT NULL DEFAULT 'USER',
    `password` VARCHAR(100) NOT NULL,
    `pictureUrl` VARCHAR(191) NOT NULL DEFAULT '',
    `rank` ENUM('JUNIOR', 'MID', 'SENIOR', 'LEAD', 'PRINCIPAL', 'NONE') NOT NULL DEFAULT 'NONE',
    `authType` VARCHAR(191) NOT NULL DEFAULT 'ID,PW',
    `prevPassword` VARCHAR(191) NOT NULL DEFAULT '',
    `isEmailVerified` VARCHAR(191) NOT NULL DEFAULT 'N',
    `userAlias` VARCHAR(191) NOT NULL DEFAULT '',
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `updatedAt` DECIMAL(20, 3) NOT NULL,
    `accountLockYn` VARCHAR(191) NOT NULL DEFAULT 'N',
    `lastLoginDate` DECIMAL(20, 3) NULL,
    `loginFailCnt` INTEGER NOT NULL DEFAULT 0,
    `mfaEnabledYn` VARCHAR(191) NOT NULL DEFAULT 'N',
    `mfaSecretKey` VARCHAR(191) NULL DEFAULT '',
    `tempPassword` VARCHAR(191) NULL,
    `resetTokenExpires` DECIMAL(20, 3) NULL,
    `resetToken` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL DEFAULT '',
    `otpCode` VARCHAR(191) NULL,
    `otpExpire` DECIMAL(20, 3) NULL,
    `baseSalary` DOUBLE NULL,
    `department` ENUM('HR', 'IT', 'FINANCE', 'OPS', 'SECURITY', 'OTHER') NULL,
    `employeeNo` VARCHAR(191) NULL,
    `hireDate` DECIMAL(20, 3) NULL,
    `position` ENUM('INTERN', 'STAFF', 'SENIOR', 'MANAGER', 'DIRECTOR', 'EXECUTIVE') NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED') NOT NULL DEFAULT 'ACTIVE',
    `fromTransferAdminUserYn` VARCHAR(191) NULL DEFAULT 'N',
    `toTransferAdminUserYn` VARCHAR(191) NULL DEFAULT 'N',
    `isDeleted` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_employeeNo_key`(`employeeNo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TransferAdmin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `fromUserId` INTEGER NOT NULL,
    `toUserId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `requestedAt` DECIMAL(20, 3) NOT NULL,
    `approvedAt` DECIMAL(20, 3) NULL,

    UNIQUE INDEX `TransferAdmin_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Message` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `content` VARCHAR(100) NOT NULL,
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `senderId` INTEGER NOT NULL,
    `receiverId` INTEGER NOT NULL,

    INDEX `Message_senderId_idx`(`senderId`),
    INDEX `Message_receiverId_idx`(`receiverId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UserSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NULL,
    `token` TEXT NOT NULL,
    `createdAt` DECIMAL(20, 3) NULL,
    `browser` VARCHAR(191) NULL,
    `device` VARCHAR(191) NULL,
    `ipAddress` VARCHAR(191) NULL,
    `isCurrent` BOOLEAN NOT NULL DEFAULT false,
    `location` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `passengerId` VARCHAR(191) NULL,

    INDEX `UserSession_userId_fkey`(`userId`),
    INDEX `UserSession_passengerId_fkey`(`passengerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Passenger` (
    `id` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `passport` VARCHAR(191) NOT NULL,
    `accountLockYn` VARCHAR(191) NOT NULL DEFAULT 'N',
    `isEmailVerified` VARCHAR(191) NOT NULL DEFAULT 'Y',
    `lastLoginDate` DECIMAL(20, 3) NULL,
    `password` VARCHAR(100) NULL,
    `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED') NOT NULL DEFAULT 'ACTIVE',
    `otpCode` VARCHAR(191) NULL,
    `otpExpire` DECIMAL(20, 3) NULL,
    `role` ENUM('PASSENGER', 'USER', 'ADMIN', 'MONITOR') NOT NULL DEFAULT 'PASSENGER',
    `loginFailCnt` INTEGER NOT NULL DEFAULT 0,
    `mfaEnabledYn` VARCHAR(191) NOT NULL DEFAULT 'N',
    `mfaSecretKey` VARCHAR(191) NULL DEFAULT '',

    UNIQUE INDEX `Passenger_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payroll` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `baseSalary` DOUBLE NOT NULL,
    `allowances` DOUBLE NOT NULL DEFAULT 0,
    `deductions` DOUBLE NOT NULL DEFAULT 0,
    `tax` DOUBLE NOT NULL DEFAULT 0,
    `netPay` DOUBLE NOT NULL,
    `status` ENUM('DRAFT', 'FINALIZED', 'PAID') NOT NULL DEFAULT 'DRAFT',
    `generatedAt` DECIMAL(20, 3) NOT NULL,

    INDEX `Payroll_employeeId_idx`(`employeeId`),
    UNIQUE INDEX `Payroll_employeeId_month_year_key`(`employeeId`, `month`, `year`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Attendance` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `date` DECIMAL(20, 3) NOT NULL,
    `checkIn` DECIMAL(20, 3) NOT NULL,
    `checkOut` DECIMAL(20, 3) NOT NULL,
    `status` ENUM('PRESENT', 'ABSENT', 'LATE', 'ON_LEAVE', 'REMOTE') NOT NULL DEFAULT 'PRESENT',
    `workedHours` DOUBLE NULL,
    `note` VARCHAR(191) NULL,
    `createdAt` DECIMAL(20, 3) NOT NULL,

    INDEX `Attendance_employeeId_idx`(`employeeId`),
    UNIQUE INDEX `Attendance_employeeId_date_key`(`employeeId`, `date`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LeaveRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `employeeId` INTEGER NOT NULL,
    `leaveType` VARCHAR(191) NOT NULL,
    `startDate` DECIMAL(20, 3) NOT NULL,
    `endDate` DECIMAL(20, 3) NOT NULL,
    `days` DOUBLE NOT NULL,
    `reason` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `approverId` INTEGER NULL,
    `approverNote` VARCHAR(191) NULL,
    `appliedAt` DECIMAL(20, 3) NOT NULL,
    `decidedAt` DECIMAL(20, 3) NULL,

    INDEX `LeaveRequest_employeeId_idx`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UnlockRequest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `reason` TEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `approvedAt` DECIMAL(20, 3) NULL,
    `employeeId` INTEGER NOT NULL,

    INDEX `UnlockRequest_employeeId_fkey`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Flight` (
    `flightId` INTEGER NOT NULL AUTO_INCREMENT,
    `flightNo` VARCHAR(10) NOT NULL,
    `departureAirport` VARCHAR(10) NOT NULL,
    `arrivalAirport` VARCHAR(10) NOT NULL,
    `aircraftCode` VARCHAR(10) NOT NULL,
    `scheduledDeparture` DECIMAL(20, 3) NOT NULL,
    `scheduledArrival` DECIMAL(20, 3) NOT NULL,
    `actualDeparture` DECIMAL(20, 3) NULL,
    `actualArrival` DECIMAL(20, 3) NULL,
    `delayMinutes` INTEGER NULL,
    `flightType` ENUM('roundtrip', 'oneway') NOT NULL DEFAULT 'oneway',
    `isCancelled` BOOLEAN NOT NULL DEFAULT false,
    `priceBusiness` DOUBLE NULL,
    `priceEconomy` DOUBLE NULL,
    `priceFirst` DOUBLE NULL,
    `cancellationReason` VARCHAR(255) NULL,
    `delayReason` VARCHAR(255) NULL,
    `gateId` VARCHAR(191) NULL,
    `isDomestic` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `Flight_flightNo_key`(`flightNo`),
    UNIQUE INDEX `Flight_gateId_key`(`gateId`),
    INDEX `Flight_aircraftCode_fkey`(`aircraftCode`),
    INDEX `Flight_arrivalAirport_fkey`(`arrivalAirport`),
    INDEX `Flight_departureAirport_fkey`(`departureAirport`),
    INDEX `Flight_gateId_idx`(`gateId`),
    PRIMARY KEY (`flightId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FlightDiscount` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `discountCodeId` INTEGER NOT NULL,
    `flightId` INTEGER NOT NULL,
    `createdAt` DECIMAL(20, 3) NOT NULL,

    INDEX `FlightDiscount_flightId_fkey`(`flightId`),
    UNIQUE INDEX `FlightDiscount_discountCodeId_flightId_key`(`discountCodeId`, `flightId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Aircraft` (
    `code` VARCHAR(191) NOT NULL,
    `model` VARCHAR(191) NOT NULL,
    `range` INTEGER NOT NULL,

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Airport` (
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `country` VARCHAR(191) NOT NULL,
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `updatedAt` DECIMAL(20, 3) NULL,

    PRIMARY KEY (`code`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Booking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `passengerId` VARCHAR(191) NOT NULL,
    `flightId` INTEGER NOT NULL,
    `bookingTime` DECIMAL(20, 3) NOT NULL,
    `bookingCode` VARCHAR(191) NULL,
    `seatClass` ENUM('VIP', 'BUSINESS', 'ECONOMY', 'FIRST') NOT NULL DEFAULT 'ECONOMY',
    `seatNo` VARCHAR(10) NOT NULL DEFAULT 'N/A',
    `seatPrice` DECIMAL(10, 2) NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'PAID') NOT NULL DEFAULT 'PENDING',

    UNIQUE INDEX `Booking_bookingCode_key`(`bookingCode`),
    INDEX `Booking_flightId_idx`(`flightId`),
    INDEX `Booking_passengerId_idx`(`passengerId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ticket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketNo` VARCHAR(191) NOT NULL,
    `passengerId` VARCHAR(191) NOT NULL,
    `flightId` INTEGER NOT NULL,
    `qrCodeImage` TEXT NULL,
    `bookingId` INTEGER NULL,

    UNIQUE INDEX `Ticket_ticketNo_key`(`ticketNo`),
    INDEX `Ticket_bookingId_idx`(`bookingId`),
    INDEX `Ticket_passengerId_idx`(`passengerId`),
    INDEX `Ticket_flightId_idx`(`flightId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BoardingPass` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ticketId` INTEGER NOT NULL,
    `issuedAt` DECIMAL(20, 3) NOT NULL,
    `flightId` INTEGER NOT NULL,
    `status` ENUM('PENDING', 'BOARDED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
    `gateId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `BoardingPass_ticketId_key`(`ticketId`),
    INDEX `BoardingPass_flightId_fkey`(`flightId`),
    INDEX `BoardingPass_gateId_fkey`(`gateId`),
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
    INDEX `Baggage_flightId_fkey`(`flightId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Meal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `mealType` ENUM('VEG', 'NONVEG', 'DRINK', 'DESSERT', 'BEVERAGE', 'SNACK', 'DINNER', 'LUNCH', 'BREAKFAST') NOT NULL,
    `description` VARCHAR(191) NULL,
    `price` DOUBLE NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `mealCode` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Meal_mealCode_key`(`mealCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Seat` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isBooked` BOOLEAN NOT NULL DEFAULT false,
    `flightId` INTEGER NOT NULL,
    `bookingId` INTEGER NULL,
    `seatNumber` INTEGER NOT NULL,
    `seatRow` VARCHAR(191) NOT NULL,
    `isAvailable` BOOLEAN NOT NULL DEFAULT true,
    `isExitRow` BOOLEAN NOT NULL DEFAULT false,
    `isExtraLegroom` BOOLEAN NOT NULL DEFAULT false,
    `note` VARCHAR(191) NULL,
    `price` DOUBLE NULL,
    `isHandicapAccessible` BOOLEAN NOT NULL DEFAULT false,
    `isNearLavatory` BOOLEAN NOT NULL DEFAULT false,
    `isUpperDeck` BOOLEAN NOT NULL DEFAULT false,
    `isWing` BOOLEAN NOT NULL DEFAULT false,
    `type` ENUM('VIP', 'BUSINESS', 'ECONOMY', 'FIRST') NOT NULL DEFAULT 'ECONOMY',

    UNIQUE INDEX `Seat_bookingId_key`(`bookingId`),
    INDEX `Seat_flightId_fkey`(`flightId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DiscountCode` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `discountAmount` DECIMAL(65, 30) NULL,
    `discountPercent` INTEGER NULL,
    `isPercentage` BOOLEAN NOT NULL DEFAULT false,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `usageLimit` INTEGER NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `validFrom` DECIMAL(20, 3) NOT NULL,
    `validTo` DECIMAL(20, 3) NOT NULL,
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `updatedAt` DECIMAL(20, 3) NOT NULL,

    UNIQUE INDEX `DiscountCode_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Facility` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `type` ENUM('RESTAURANT', 'SHOP', 'LOUNGE', 'INFORMATION', 'SECURITY', 'TRANSPORTATION', 'OTHER') NOT NULL,
    `description` VARCHAR(191) NULL,
    `terminalId` VARCHAR(191) NOT NULL,
    `location` VARCHAR(191) NULL,
    `openingHours` VARCHAR(191) NULL,
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `updatedAt` DECIMAL(20, 3) NOT NULL,

    INDEX `Facility_terminalId_fkey`(`terminalId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Terminal` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NULL,
    `type` ENUM('INTERNATIONAL', 'DOMESTIC', 'BUSINESS') NOT NULL,
    `airportId` VARCHAR(191) NOT NULL,
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `updatedAt` DECIMAL(20, 3) NOT NULL,

    UNIQUE INDEX `Terminal_code_key`(`code`),
    UNIQUE INDEX `Terminal_airportId_code_key`(`airportId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `GateAssignment` (
    `id` VARCHAR(191) NOT NULL,
    `gateId` VARCHAR(191) NOT NULL,
    `flightId` INTEGER NOT NULL,
    `assignedAt` DECIMAL(20, 3) NOT NULL,
    `releasedAt` DECIMAL(20, 3) NOT NULL,
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `updatedAt` DECIMAL(20, 3) NOT NULL,

    INDEX `GateAssignment_flightId_fkey`(`flightId`),
    UNIQUE INDEX `GateAssignment_gateId_flightId_key`(`gateId`, `flightId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Gate` (
    `id` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `terminalId` VARCHAR(191) NOT NULL,
    `status` ENUM('AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'CLOSED') NOT NULL DEFAULT 'AVAILABLE',
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `updatedAt` DECIMAL(20, 3) NOT NULL,

    UNIQUE INDEX `Gate_code_key`(`code`),
    UNIQUE INDEX `Gate_terminalId_code_key`(`terminalId`, `code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FlightMeal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `flightId` INTEGER NOT NULL,
    `mealId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,
    `price` DOUBLE NULL,

    INDEX `FlightMeal_flightId_fkey`(`flightId`),
    INDEX `FlightMeal_mealId_fkey`(`mealId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MealOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `bookingId` INTEGER NOT NULL,
    `mealId` INTEGER NOT NULL,
    `quantity` INTEGER NOT NULL DEFAULT 1,

    INDEX `MealOrder_bookingId_fkey`(`bookingId`),
    INDEX `MealOrder_mealId_fkey`(`mealId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `FlightStatus` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `flightId` INTEGER NOT NULL,
    `status` ENUM('SCHEDULED', 'BOARDING', 'LANDED', 'DELAYED', 'DEPARTED', 'ARRIVED', 'CANCELLED') NOT NULL DEFAULT 'SCHEDULED',
    `description` VARCHAR(255) NULL,
    `updatedAt` DECIMAL(20, 3) NOT NULL,

    INDEX `FlightStatus_flightId_fkey`(`flightId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Hotel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `rating` DOUBLE NOT NULL,
    `reviewCount` INTEGER NOT NULL DEFAULT 0,
    `distanceToCenter` DOUBLE NOT NULL,
    `imageUrl` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `discountPercent` DOUBLE NULL,
    `isPrime` BOOLEAN NOT NULL DEFAULT false,
    `freeWifi` BOOLEAN NOT NULL DEFAULT false,
    `covidMeasures` BOOLEAN NOT NULL DEFAULT false,
    `freeCancel` BOOLEAN NOT NULL DEFAULT false,
    `payLater` BOOLEAN NOT NULL DEFAULT false,
    `rooms` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DECIMAL(20, 3) NOT NULL,
    `updatedAt` DECIMAL(20, 3) NOT NULL,
    `hotelCode` VARCHAR(191) NULL,

    UNIQUE INDEX `Hotel_hotelCode_key`(`hotelCode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
    `createdAt` DECIMAL(20, 3) NOT NULL DEFAULT (unix_timestamp() * 1000),
    `updatedAt` DECIMAL(20, 3) NOT NULL,

    UNIQUE INDEX `Payment_transactionId_key`(`transactionId`),
    INDEX `Payment_ticketId_fkey`(`ticketId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `TransferAdmin` ADD CONSTRAINT `TransferAdmin_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_receiverId_fkey` FOREIGN KEY (`receiverId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Message` ADD CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSession` ADD CONSTRAINT `UserSession_passengerId_fkey` FOREIGN KEY (`passengerId`) REFERENCES `Passenger`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserSession` ADD CONSTRAINT `UserSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payroll` ADD CONSTRAINT `Payroll_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UnlockRequest` ADD CONSTRAINT `UnlockRequest_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_aircraftCode_fkey` FOREIGN KEY (`aircraftCode`) REFERENCES `Aircraft`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_arrivalAirport_fkey` FOREIGN KEY (`arrivalAirport`) REFERENCES `Airport`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_departureAirport_fkey` FOREIGN KEY (`departureAirport`) REFERENCES `Airport`(`code`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flight` ADD CONSTRAINT `Flight_gateId_fkey` FOREIGN KEY (`gateId`) REFERENCES `Gate`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlightDiscount` ADD CONSTRAINT `FlightDiscount_discountCodeId_fkey` FOREIGN KEY (`discountCodeId`) REFERENCES `DiscountCode`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlightDiscount` ADD CONSTRAINT `FlightDiscount_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Booking` ADD CONSTRAINT `Booking_passengerId_fkey` FOREIGN KEY (`passengerId`) REFERENCES `Passenger`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_passengerId_fkey` FOREIGN KEY (`passengerId`) REFERENCES `Passenger`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoardingPass` ADD CONSTRAINT `BoardingPass_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoardingPass` ADD CONSTRAINT `BoardingPass_gateId_fkey` FOREIGN KEY (`gateId`) REFERENCES `Gate`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `BoardingPass` ADD CONSTRAINT `BoardingPass_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Baggage` ADD CONSTRAINT `Baggage_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Baggage` ADD CONSTRAINT `Baggage_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Seat` ADD CONSTRAINT `Seat_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Seat` ADD CONSTRAINT `Seat_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Facility` ADD CONSTRAINT `Facility_terminalId_fkey` FOREIGN KEY (`terminalId`) REFERENCES `Terminal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Terminal` ADD CONSTRAINT `Terminal_airportId_fkey` FOREIGN KEY (`airportId`) REFERENCES `Airport`(`code`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GateAssignment` ADD CONSTRAINT `GateAssignment_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`flightId`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `GateAssignment` ADD CONSTRAINT `GateAssignment_gateId_fkey` FOREIGN KEY (`gateId`) REFERENCES `Gate`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Gate` ADD CONSTRAINT `Gate_terminalId_fkey` FOREIGN KEY (`terminalId`) REFERENCES `Terminal`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlightMeal` ADD CONSTRAINT `FlightMeal_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlightMeal` ADD CONSTRAINT `FlightMeal_mealId_fkey` FOREIGN KEY (`mealId`) REFERENCES `Meal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MealOrder` ADD CONSTRAINT `MealOrder_bookingId_fkey` FOREIGN KEY (`bookingId`) REFERENCES `Booking`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MealOrder` ADD CONSTRAINT `MealOrder_mealId_fkey` FOREIGN KEY (`mealId`) REFERENCES `Meal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `FlightStatus` ADD CONSTRAINT `FlightStatus_flightId_fkey` FOREIGN KEY (`flightId`) REFERENCES `Flight`(`flightId`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `Ticket`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
