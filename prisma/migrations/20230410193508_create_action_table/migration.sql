-- CreateTable
CREATE TABLE `Action` (
    `id` VARCHAR(191) NOT NULL,
    `description` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `dueDate` DATETIME(3) NOT NULL,
    `assignedTo` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `createdBy` VARCHAR(191) NOT NULL,
    `updatedBy` VARCHAR(191) NOT NULL,
    `organizationId` VARCHAR(191) NOT NULL,
    `workplaceId` VARCHAR(191) NOT NULL,
    `definitionTaskId` VARCHAR(191) NOT NULL,

    INDEX `Action_definitionTaskId_idx`(`definitionTaskId`),
    INDEX `Action_workplaceId_idx`(`workplaceId`),
    INDEX `Action_organizationId_idx`(`organizationId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
