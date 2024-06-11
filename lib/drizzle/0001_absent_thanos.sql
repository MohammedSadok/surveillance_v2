CREATE TABLE `studentExamLocation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`locationId` int NOT NULL,
	`studentId` int NOT NULL,
	`examId` int NOT NULL,
	CONSTRAINT `studentExamLocation_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
--> statement-breakpoint
ALTER TABLE `studentExamLocation`
ADD CONSTRAINT `studentExamLocation_locationId_location_id_fk` FOREIGN KEY (`locationId`) REFERENCES `location`(`id`) ON DELETE cascade ON UPDATE cascade;
--> statement-breakpoint
ALTER TABLE `studentExamLocation`
ADD CONSTRAINT `studentExamLocation_studentId_student_id_fk` FOREIGN KEY (`studentId`) REFERENCES `student`(`id`) ON DELETE cascade ON UPDATE cascade;
--> statement-breakpoint
ALTER TABLE `studentExamLocation`
ADD CONSTRAINT `studentExamLocation_examId_exam_id_fk` FOREIGN KEY (`examId`) REFERENCES `exam`(`id`) ON DELETE cascade ON UPDATE cascade;