/*
  Warnings:

  - You are about to drop the `PossiblyValidTest` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `PossiblyValidTest` DROP FOREIGN KEY `PossiblyValidTest_studentId_fkey`;

-- AlterTable
ALTER TABLE `Student` MODIFY `lastValidTestId` INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE `PossiblyValidTest`;
