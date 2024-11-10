/*
  Warnings:

  - The primary key for the `reviews` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `comment` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `id_projects` on the `reviews` table. All the data in the column will be lost.
  - You are about to drop the column `id_reviews` on the `reviews` table. All the data in the column will be lost.
  - Added the required column `id` to the `reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `review_text` to the `reviews` table without a default value. This is not possible if the table is not empty.
  - Made the column `user_id` on table `reviews` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `fk_projects`;

-- DropForeignKey
ALTER TABLE `reviews` DROP FOREIGN KEY `fk_user`;

-- AlterTable
ALTER TABLE `reviews` DROP PRIMARY KEY,
    DROP COLUMN `comment`,
    DROP COLUMN `created_at`,
    DROP COLUMN `id_projects`,
    DROP COLUMN `id_reviews`,
    ADD COLUMN `created-at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `review_text` TEXT NOT NULL,
    MODIFY `user_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `likes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `review_id` INTEGER NULL,
    `user_id` INTEGER NOT NULL,
    `created_at` TIMESTAMP(0) NULL DEFAULT CURRENT_TIMESTAMP(0),

    INDEX `review_id`(`review_id`),
    INDEX `userid`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `fk_user` FOREIGN KEY (`user_id`) REFERENCES `user_accounts`(`ID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `review_id` FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `likes` ADD CONSTRAINT `userid` FOREIGN KEY (`user_id`) REFERENCES `user_accounts`(`ID`) ON DELETE CASCADE ON UPDATE NO ACTION;

-- RenameIndex
ALTER TABLE `reviews` RENAME INDEX `fk_user` TO `user_id`;
