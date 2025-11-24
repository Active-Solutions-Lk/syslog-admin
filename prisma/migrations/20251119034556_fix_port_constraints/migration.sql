-- DropForeignKey
ALTER TABLE `projects` DROP FOREIGN KEY `fk_port_id_with_ports_id`;

-- DropIndex
DROP INDEX `unique_port_id` ON `projects`;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `fk_port_id_with_ports_id` FOREIGN KEY (`port_id`) REFERENCES `ports`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
