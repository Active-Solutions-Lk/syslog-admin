-- AlterTable
ALTER TABLE `projects` ADD COLUMN `port_id` INTEGER NULL;

-- CreateIndex
CREATE INDEX `port_id` ON `projects`(`port_id`);

-- CreateIndex
CREATE UNIQUE INDEX `unique_port_id` ON `projects`(`port_id`);

-- CreateIndex
CREATE UNIQUE INDEX `unique_collector_port` ON `projects`(`collector_ip`, `port_id`);

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `fk_port_id_with_ports_id` FOREIGN KEY (`port_id`) REFERENCES `ports`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Make ports.project_id unique
CREATE UNIQUE INDEX `unique_project_id` ON `ports`(`project_id`);