/*
  Warnings:

  - You are about to drop the column `organizationId` on the `Action` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Action_organizationId_idx` ON `Action`;

-- AlterTable
ALTER TABLE `Action` DROP COLUMN `organizationId`;
