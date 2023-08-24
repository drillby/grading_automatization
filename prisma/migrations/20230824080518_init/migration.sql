-- CreateTable
CREATE TABLE `Student` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `moodleId` INTEGER NOT NULL,
    `bakalariId` INTEGER NOT NULL,
    `lastValidTestId` INTEGER NOT NULL,

    UNIQUE INDEX `Student_moodleId_key`(`moodleId`),
    UNIQUE INDEX `Student_bakalariId_key`(`bakalariId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PossiblyValidTest` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `studentId` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PossiblyValidTest` ADD CONSTRAINT `PossiblyValidTest_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
