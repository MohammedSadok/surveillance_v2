ALTER TABLE `student` ADD `optionId` varchar(20) NOT NULL;--> statement-breakpoint
ALTER TABLE `student` ADD CONSTRAINT `student_optionId_option_id_fk` FOREIGN KEY (`optionId`) REFERENCES `option`(`id`) ON DELETE cascade ON UPDATE cascade;