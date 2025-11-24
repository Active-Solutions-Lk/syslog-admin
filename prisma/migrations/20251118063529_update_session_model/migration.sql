/*
  Warnings:

  - You are about to drop the column `project_id` on the `ports` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `fk_project_id_with_project_id` ON `ports`;

-- DropIndex
DROP INDEX `unique_project_id` ON `ports`;

-- AlterTable
ALTER TABLE `ports` DROP COLUMN `project_id`;
