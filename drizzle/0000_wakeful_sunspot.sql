CREATE TABLE `Department` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	CONSTRAINT `Department_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `Exam` (
	`id` int AUTO_INCREMENT NOT NULL,
	`moduleName` varchar(100) NOT NULL,
	`module` varchar(20) NOT NULL,
	`timeSlotId` int NOT NULL,
	`responsibleId` int NOT NULL,
	CONSTRAINT `Exam_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `Location` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`size` int NOT NULL,
	`type` varchar(20) NOT NULL,
	CONSTRAINT `Location_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `Module` (
	`id` varchar(20) NOT NULL,
	`name` varchar(50) NOT NULL,
	`optionId` varchar(20) NOT NULL,
	CONSTRAINT `Module_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `Monitoring` (
	`id` int AUTO_INCREMENT NOT NULL,
	`examId` int NOT NULL,
	`locationId` int NOT NULL,
	CONSTRAINT `Monitoring_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `MonitoringLine` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teacherId` int NOT NULL,
	`monitoringId` int NOT NULL,
	CONSTRAINT `MonitoringLine_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `OccupiedLocation` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cause` varchar(50) NOT NULL,
	`locationId` int NOT NULL,
	`timeSlotId` int NOT NULL,
	CONSTRAINT `OccupiedLocation_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `OccupiedTeacher` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cause` varchar(50) NOT NULL,
	`teacherId` int NOT NULL,
	`timeSlotId` int NOT NULL,
	CONSTRAINT `OccupiedTeacher_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `Option` (
	`id` varchar(20) NOT NULL,
	`name` varchar(50) NOT NULL,
	CONSTRAINT `Option_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `SessionExam` (
	`id` int AUTO_INCREMENT NOT NULL,
	`isValidated` boolean NOT NULL DEFAULT false,
	`type` varchar(50) NOT NULL,
	`startDate` date NOT NULL,
	`endDate` date NOT NULL,
	CONSTRAINT `SessionExam_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `Student` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cin` varchar(10) NOT NULL,
	`firstName` varchar(50) NOT NULL,
	`lastName` varchar(50) NOT NULL,
	`sessionExamId` int NOT NULL,
	`moduleId` varchar(20) NOT NULL,
	CONSTRAINT `Student_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `Teacher` (
	`id` int AUTO_INCREMENT NOT NULL,
	`lastName` varchar(50) NOT NULL,
	`firstName` varchar(50) NOT NULL,
	`phoneNumber` varchar(15) NOT NULL,
	`email` varchar(50) NOT NULL,
	`isDispense` boolean NOT NULL DEFAULT false,
	`departmentId` int NOT NULL,
	CONSTRAINT `Teacher_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `TimeSlot` (
	`id` int AUTO_INCREMENT NOT NULL,
	`date` date NOT NULL,
	`period` varchar(20) NOT NULL,
	`timePeriod` varchar(10) NOT NULL,
	`sessionExamId` int NOT NULL,
	CONSTRAINT `TimeSlot_id` PRIMARY KEY(`id`)
) ENGINE = InnoDB;
CREATE TABLE `session` (
	`sessionToken` varchar(100) NOT NULL,
	`userId` int NOT NULL,
	`expires` timestamp NOT NULL,
	CONSTRAINT `session_sessionToken` PRIMARY KEY(`sessionToken`)
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
ALTER TABLE `Exam`
ADD CONSTRAINT `Exam_module_Module_id_fk` FOREIGN KEY (`module`) REFERENCES `Module`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `Exam`
ADD CONSTRAINT `Exam_timeSlotId_TimeSlot_id_fk` FOREIGN KEY (`timeSlotId`) REFERENCES `TimeSlot`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `Exam`
ADD CONSTRAINT `Exam_responsibleId_Teacher_id_fk` FOREIGN KEY (`responsibleId`) REFERENCES `Teacher`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `Module`
ADD CONSTRAINT `Module_optionId_Option_id_fk` FOREIGN KEY (`optionId`) REFERENCES `Option`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `Monitoring`
ADD CONSTRAINT `Monitoring_examId_Exam_id_fk` FOREIGN KEY (`examId`) REFERENCES `Exam`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `Monitoring`
ADD CONSTRAINT `Monitoring_locationId_Location_id_fk` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `MonitoringLine`
ADD CONSTRAINT `MonitoringLine_teacherId_Teacher_id_fk` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `MonitoringLine`
ADD CONSTRAINT `MonitoringLine_monitoringId_Monitoring_id_fk` FOREIGN KEY (`monitoringId`) REFERENCES `Monitoring`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `OccupiedLocation`
ADD CONSTRAINT `OccupiedLocation_locationId_Location_id_fk` FOREIGN KEY (`locationId`) REFERENCES `Location`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `OccupiedLocation`
ADD CONSTRAINT `OccupiedLocation_timeSlotId_TimeSlot_id_fk` FOREIGN KEY (`timeSlotId`) REFERENCES `TimeSlot`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `OccupiedTeacher`
ADD CONSTRAINT `OccupiedTeacher_teacherId_Teacher_id_fk` FOREIGN KEY (`teacherId`) REFERENCES `Teacher`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `OccupiedTeacher`
ADD CONSTRAINT `OccupiedTeacher_timeSlotId_TimeSlot_id_fk` FOREIGN KEY (`timeSlotId`) REFERENCES `TimeSlot`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `Student`
ADD CONSTRAINT `Student_sessionExamId_SessionExam_id_fk` FOREIGN KEY (`sessionExamId`) REFERENCES `SessionExam`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `Student`
ADD CONSTRAINT `Student_moduleId_Module_id_fk` FOREIGN KEY (`moduleId`) REFERENCES `Module`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `Teacher`
ADD CONSTRAINT `Teacher_departmentId_Department_id_fk` FOREIGN KEY (`departmentId`) REFERENCES `Department`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `TimeSlot`
ADD CONSTRAINT `TimeSlot_sessionExamId_SessionExam_id_fk` FOREIGN KEY (`sessionExamId`) REFERENCES `SessionExam`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `session`
ADD CONSTRAINT `session_userId_user_id_fk` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE cascade ON UPDATE cascade;