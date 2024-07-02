-- DropIndex
DROP INDEX `advanced_hotspots_layerId_fkey` ON `advanced_hotspots`;

-- DropIndex
DROP INDEX `advanced_hotspots_sceneId_fkey` ON `advanced_hotspots`;

-- AlterTable
ALTER TABLE `advanced_hotspots` ADD COLUMN `title_en` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `group_scenes` ADD COLUMN `parent_id` VARCHAR(191) NULL,
    MODIFY `name_en` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `info_hotspots` ADD COLUMN `description_en` TEXT NULL,
    ADD COLUMN `title_en` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `scenes` ADD COLUMN `audioEnId` VARCHAR(191) NULL,
    ADD COLUMN `description_en` TEXT NULL,
    ADD COLUMN `latitude` VARCHAR(191) NULL,
    ADD COLUMN `longitude` VARCHAR(191) NULL,
    MODIFY `name_en` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `group_scenes` ADD CONSTRAINT `group_scenes_parent_id_fkey` FOREIGN KEY (`parent_id`) REFERENCES `group_scenes`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `scenes` ADD CONSTRAINT `scenes_audioEnId_fkey` FOREIGN KEY (`audioEnId`) REFERENCES `files`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advanced_hotspots` ADD CONSTRAINT `advanced_hotspots_layerId_fkey` FOREIGN KEY (`layerId`) REFERENCES `files`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `advanced_hotspots` ADD CONSTRAINT `advanced_hotspots_sceneId_fkey` FOREIGN KEY (`sceneId`) REFERENCES `scenes`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
