CREATE TABLE `department` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	CONSTRAINT `department_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `exam` (
	`id` int AUTO_INCREMENT NOT NULL,
	`module` varchar(20) NOT NULL,
	`timeSlotId` int NOT NULL,
	`responsibleId` int NOT NULL,
	CONSTRAINT `exam_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `location` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`size` int NOT NULL,
	`type` enum('CLASSROOM', 'AMPHITHEATER') NOT NULL,
	CONSTRAINT `location_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `module` (
	`id` varchar(20) NOT NULL,
	`name` varchar(50) NOT NULL,
	`optionId` varchar(20) NOT NULL,
	CONSTRAINT `module_id_name_pk` PRIMARY KEY(`id`, `optionId`)
) ENGINE = InnoDB;
CREATE TABLE `monitoring` (
	`id` int AUTO_INCREMENT NOT NULL,
	`examId` int NOT NULL,
	`locationId` int NOT NULL,
	CONSTRAINT `monitoring_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `monitoringLine` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherId` int NOT NULL,
	`monitoringId` int NOT NULL,
	CONSTRAINT `monitoringLine_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `occupiedLocation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cause` varchar(50) NOT NULL,
	`locationId` int NOT NULL,
	`timeSlotId` int NOT NULL,
	CONSTRAINT `occupiedLocation_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `occupiedTeacher` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cause` varchar(50) NOT NULL,
	`teacherId` int NOT NULL,
	`timeSlotId` int NOT NULL,
	CONSTRAINT `occupiedTeacher_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `option` (
	`id` varchar(20) NOT NULL,
	`name` varchar(50) NOT NULL,
	CONSTRAINT `option_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `sessionExam` (
	`id` int AUTO_INCREMENT NOT NULL,
	`isValidated` boolean NOT NULL DEFAULT false,
	`type` varchar(50) NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	CONSTRAINT `sessionExam_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `student` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cin` varchar(10) NOT NULL,
	`firstName` varchar(50) NOT NULL,
	`lastName` varchar(50) NOT NULL,
	`sessionExamId` int NOT NULL,
	`moduleId` varchar(20) NOT NULL,
	CONSTRAINT `student_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `teacher` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lastName` varchar(50) NOT NULL,
	`firstName` varchar(50) NOT NULL,
	`phoneNumber` varchar(15) NOT NULL,
	`email` varchar(50) NOT NULL,
	`isDispense` boolean NOT NULL DEFAULT false,
	`departmentId` int NOT NULL,
	CONSTRAINT `teacher_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `timeSlot` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` date NOT NULL,
	`period` varchar(20) NOT NULL,
	`timePeriod` varchar(20) NOT NULL,
	`sessionExamId` int NOT NULL,
	CONSTRAINT `timeSlot_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(50) NOT NULL,
	`password` varchar(100) NOT NULL,
	`isAdmin` boolean NOT NULL DEFAULT false,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
) ENGINE = InnoDB;
ALTER TABLE `exam`
ADD CONSTRAINT `exam_module_module_id_fk` FOREIGN KEY (`module`) REFERENCES `module`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `exam`
ADD CONSTRAINT `exam_timeSlotId_timeSlot_id_fk` FOREIGN KEY (`timeSlotId`) REFERENCES `timeSlot`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `exam`
ADD CONSTRAINT `exam_responsibleId_teacher_id_fk` FOREIGN KEY (`responsibleId`) REFERENCES `teacher`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `module`
ADD CONSTRAINT `module_optionId_option_id_fk` FOREIGN KEY (`optionId`) REFERENCES `option`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `monitoring`
ADD CONSTRAINT `monitoring_examId_exam_id_fk` FOREIGN KEY (`examId`) REFERENCES `exam`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `monitoring`
ADD CONSTRAINT `monitoring_locationId_location_id_fk` FOREIGN KEY (`locationId`) REFERENCES `location`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `monitoringLine`
ADD CONSTRAINT `monitoringLine_teacherId_teacher_id_fk` FOREIGN KEY (`teacherId`) REFERENCES `teacher`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `monitoringLine`
ADD CONSTRAINT `monitoringLine_monitoringId_monitoring_id_fk` FOREIGN KEY (`monitoringId`) REFERENCES `monitoring`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `occupiedLocation`
ADD CONSTRAINT `occupiedLocation_locationId_location_id_fk` FOREIGN KEY (`locationId`) REFERENCES `location`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `occupiedLocation`
ADD CONSTRAINT `occupiedLocation_timeSlotId_timeSlot_id_fk` FOREIGN KEY (`timeSlotId`) REFERENCES `timeSlot`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `occupiedTeacher`
ADD CONSTRAINT `occupiedTeacher_teacherId_teacher_id_fk` FOREIGN KEY (`teacherId`) REFERENCES `teacher`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `occupiedTeacher`
ADD CONSTRAINT `occupiedTeacher_timeSlotId_timeSlot_id_fk` FOREIGN KEY (`timeSlotId`) REFERENCES `timeSlot`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `student`
ADD CONSTRAINT `student_sessionExamId_sessionExam_id_fk` FOREIGN KEY (`sessionExamId`) REFERENCES `sessionExam`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `student`
ADD CONSTRAINT `student_moduleId_module_id_fk` FOREIGN KEY (`moduleId`) REFERENCES `module`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `teacher`
ADD CONSTRAINT `teacher_departmentId_department_id_fk` FOREIGN KEY (`departmentId`) REFERENCES `department`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `timeSlot`
ADD CONSTRAINT `timeSlot_sessionExamId_sessionExam_id_fk` FOREIGN KEY (`sessionExamId`) REFERENCES `sessionExam`(`id`) ON DELETE cascade ON UPDATE cascade;