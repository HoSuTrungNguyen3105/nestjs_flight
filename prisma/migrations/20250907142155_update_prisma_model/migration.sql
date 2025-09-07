/*
  Warnings:

  - A unique constraint covering the columns `[employeeNo]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `User` ADD COLUMN `baseSalary` DOUBLE NULL,
    ADD COLUMN `department` VARCHAR(191) NULL,
    ADD COLUMN `employeeNo` VARCHAR(191) NULL,
    ADD COLUMN `hireDate` DECIMAL(20, 3) NULL,
    ADD COLUMN `position` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('ACTIVE', 'INACTIVE', 'SUSPENDED', 'TERMINATED') NOT NULL DEFAULT 'ACTIVE';

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
    `decidedAt` DECIMAL(20, 3) NOT NULL,

    INDEX `LeaveRequest_employeeId_idx`(`employeeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_employeeNo_key` ON `User`(`employeeNo`);

-- AddForeignKey
ALTER TABLE `Payroll` ADD CONSTRAINT `Payroll_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Attendance` ADD CONSTRAINT `Attendance_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LeaveRequest` ADD CONSTRAINT `LeaveRequest_employeeId_fkey` FOREIGN KEY (`employeeId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
