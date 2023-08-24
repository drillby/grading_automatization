/*
  Warnings:

  - The primary key for the `Student` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - Made the column `studentId` on table `PossiblyValidTest` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `class` to the `Student` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `PossiblyValidTest` DROP FOREIGN KEY `PossiblyValidTest_studentId_fkey`;

-- AlterTable
ALTER TABLE `PossiblyValidTest` MODIFY `studentId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Student` DROP PRIMARY KEY,
    ADD COLUMN `class` VARCHAR(191) NOT NULL,
    MODIFY `id` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AddForeignKey
ALTER TABLE `PossiblyValidTest` ADD CONSTRAINT `PossiblyValidTest_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
