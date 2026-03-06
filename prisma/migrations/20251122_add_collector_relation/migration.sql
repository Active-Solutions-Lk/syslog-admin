-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `fk_collector_ip_collectors_id` FOREIGN KEY (`collector_ip`) REFERENCES `collectors`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;