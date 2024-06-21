CREATE TABLE `department` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(100) NOT NULL,
  CONSTRAINT `department_id` PRIMARY KEY(`id`)
) Engine = InnoDB;
CREATE TABLE `exam` (
  `id` int AUTO_INCREMENT NOT NULL,
  `module` varchar(20) NOT NULL,
  `timeSlotId` int NOT NULL,
  `responsibleId` int NOT NULL,
  CONSTRAINT `exam_id` PRIMARY KEY(`id`)
) Engine = InnoDB;
CREATE TABLE `location` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(100) NOT NULL,
  `size` int NOT NULL,
  `type` enum('CLASSROOM', 'AMPHITHEATER') NOT NULL,
  CONSTRAINT `location_id` PRIMARY KEY(`id`)
) Engine = InnoDB;
CREATE TABLE `moduleOption` (
  `id` int AUTO_INCREMENT NOT NULL,
  `moduleId` varchar(20) NOT NULL,
  `optionId` varchar(20) NOT NULL,
  CONSTRAINT `moduleOption_id` PRIMARY KEY(`id`)
) Engine = InnoDB;
CREATE TABLE `module` (
  `id` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  CONSTRAINT `module_id` PRIMARY KEY(`id`)
) Engine = InnoDB;
CREATE TABLE `monitoring` (
  `id` int AUTO_INCREMENT NOT NULL,
  `examId` int NOT NULL,
  `locationId` int NOT NULL,
  CONSTRAINT `monitoring_id` PRIMARY KEY(`id`)
) Engine = InnoDB;
CREATE TABLE `monitoringLine` (
  `id` int AUTO_INCREMENT NOT NULL,
  `teacherId` int NOT NULL,
  `monitoringId` int NOT NULL,
  CONSTRAINT `monitoringLine_id` PRIMARY KEY(`id`)
) Engine = InnoDB;
CREATE TABLE `occupiedLocation` (
  `id` int AUTO_INCREMENT NOT NULL,
  `cause` varchar(50) NOT NULL,
  `locationId` int NOT NULL,
  `timeSlotId` int NOT NULL,
  CONSTRAINT `occupiedLocation_id` PRIMARY KEY(`id`)
) Engine = InnoDB;
CREATE TABLE `occupiedTeacher` (
  `id` int AUTO_INCREMENT NOT NULL,
  `cause` varchar(50) NOT NULL,
  `teacherId` int NOT NULL,
  `timeSlotId` int NOT NULL,
  CONSTRAINT `occupiedTeacher_id` PRIMARY KEY(`id`)
) Engine = InnoDB;
CREATE TABLE `option` (
  `id` varchar(20) NOT NULL,
  `name` varchar(50) NOT NULL,
  CONSTRAINT `option_id` PRIMARY KEY(`id`)
) Engine = InnoDB;
CREATE TABLE `sessionExam` (
  `id` int AUTO_INCREMENT NOT NULL,
  `isValidated` boolean NOT NULL DEFAULT false,
  `type` varchar(50) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  CONSTRAINT `sessionExam_id` PRIMARY KEY(`id`)
) Engine = InnoDB;
CREATE TABLE `student` (
  `id` int AUTO_INCREMENT NOT NULL,
  `cne` varchar(20) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `sessionExamId` int NOT NULL,
  `moduleId` varchar(20) NOT NULL,
  `optionId` varchar(20) NOT NULL,
  CONSTRAINT `student_id` PRIMARY KEY(`id`)
) Engine = InnoDB;
CREATE TABLE `studentExamLocation` (
  `id` int AUTO_INCREMENT NOT NULL,
  `cne` varchar(20) NOT NULL,
  `numberOfStudent` int NOT NULL,
  `locationId` int NOT NULL,
  `examId` int NOT NULL,
  CONSTRAINT `studentExamLocation_id` PRIMARY KEY(`id`)
) Engine = InnoDB;
CREATE TABLE `teacher` (
  `id` int AUTO_INCREMENT NOT NULL,
  `lastName` varchar(50) NOT NULL,
  `firstName` varchar(50) NOT NULL,
  `phoneNumber` varchar(15) NOT NULL,
  `email` varchar(50) NOT NULL,
  `isDispense` boolean NOT NULL DEFAULT false,
  `departmentId` int NOT NULL,
  CONSTRAINT `teacher_id` PRIMARY KEY(`id`)
) Engine = InnoDB;
CREATE TABLE `timeSlot` (
  `id` int AUTO_INCREMENT NOT NULL,
  `date` date NOT NULL,
  `period` varchar(20) NOT NULL,
  `timePeriod` varchar(20) NOT NULL,
  `sessionExamId` int NOT NULL,
  CONSTRAINT `timeSlot_id` PRIMARY KEY(`id`)
) Engine = InnoDB;
CREATE TABLE `user` (
  `id` int AUTO_INCREMENT NOT NULL,
  `name` varchar(100) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `isAdmin` boolean NOT NULL DEFAULT false,
  CONSTRAINT `user_id` PRIMARY KEY(`id`),
  CONSTRAINT `user_email_unique` UNIQUE(`email`)
) Engine = InnoDB;
ALTER TABLE `exam`
ADD CONSTRAINT `exam_module_module_id_fk` FOREIGN KEY (`module`) REFERENCES `module`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `exam`
ADD CONSTRAINT `exam_timeSlotId_timeSlot_id_fk` FOREIGN KEY (`timeSlotId`) REFERENCES `timeSlot`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `exam`
ADD CONSTRAINT `exam_responsibleId_teacher_id_fk` FOREIGN KEY (`responsibleId`) REFERENCES `teacher`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `moduleOption`
ADD CONSTRAINT `moduleOption_moduleId_module_id_fk` FOREIGN KEY (`moduleId`) REFERENCES `module`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `moduleOption`
ADD CONSTRAINT `moduleOption_optionId_option_id_fk` FOREIGN KEY (`optionId`) REFERENCES `option`(`id`) ON DELETE cascade ON UPDATE cascade;
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
ALTER TABLE `student`
ADD CONSTRAINT `student_optionId_option_id_fk` FOREIGN KEY (`optionId`) REFERENCES `option`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `studentExamLocation`
ADD CONSTRAINT `studentExamLocation_locationId_location_id_fk` FOREIGN KEY (`locationId`) REFERENCES `location`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `studentExamLocation`
ADD CONSTRAINT `studentExamLocation_examId_exam_id_fk` FOREIGN KEY (`examId`) REFERENCES `exam`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `teacher`
ADD CONSTRAINT `teacher_departmentId_department_id_fk` FOREIGN KEY (`departmentId`) REFERENCES `department`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `timeSlot`
ADD CONSTRAINT `timeSlot_sessionExamId_sessionExam_id_fk` FOREIGN KEY (`sessionExamId`) REFERENCES `sessionExam`(`id`) ON DELETE cascade ON UPDATE cascade;
INSERT INTO `department` (`id`, `name`)
VALUES (1, 'Informatique'),
  (2, 'Mathématiques'),
  (3, 'Physique'),
  (4, 'Biologie'),
  (5, 'Chimie'),
  (6, 'Géologie'),
  (7, 'Langue');
INSERT INTO `location` (`id`, `name`, `size`, `type`)
VALUES (1, 'NO', 100, 'AMPHITHEATER'),
  (2, 'F', 80, 'AMPHITHEATER'),
  (3, 'B', 80, 'AMPHITHEATER'),
  (4, 'H', 80, 'AMPHITHEATER'),
  (5, 'Y', 65, 'AMPHITHEATER'),
  (6, 'NA', 65, 'AMPHITHEATER'),
  (7, 'A1', 40, 'CLASSROOM'),
  (8, 'A2', 40, 'CLASSROOM'),
  (9, 'A3', 40, 'CLASSROOM'),
  (10, 'A4', 40, 'CLASSROOM'),
  (11, 'A5', 40, 'CLASSROOM'),
  (12, 'A6', 40, 'CLASSROOM'),
  (13, 'A7', 40, 'CLASSROOM'),
  (14, 'A8', 40, 'CLASSROOM'),
  (15, 'A9', 40, 'CLASSROOM'),
  (16, 'A10', 40, 'CLASSROOM'),
  (17, 'A11', 40, 'CLASSROOM'),
  (18, 'A12', 40, 'CLASSROOM'),
  (19, 'A13', 40, 'CLASSROOM'),
  (20, 'A14', 40, 'CLASSROOM'),
  (21, 'A15', 40, 'CLASSROOM'),
  (22, 'A16', 40, 'CLASSROOM'),
  (23, 'B17', 40, 'CLASSROOM'),
  (24, 'B21', 40, 'CLASSROOM'),
  (25, 'B22', 40, 'CLASSROOM'),
  (26, 'B24', 40, 'CLASSROOM'),
  (27, 'B26', 40, 'CLASSROOM'),
  (28, 'B27', 40, 'CLASSROOM'),
  (29, 'B29', 40, 'CLASSROOM'),
  (30, 'B31', 40, 'CLASSROOM'),
  (31, 'D41', 45, 'CLASSROOM'),
  (32, 'D42', 45, 'CLASSROOM'),
  (33, 'D43', 45, 'CLASSROOM'),
  (34, 'D44', 45, 'CLASSROOM'),
  (35, 'D46', 45, 'CLASSROOM'),
  (36, 'D47', 45, 'CLASSROOM'),
  (37, 'D48', 45, 'CLASSROOM'),
  (38, 'D49', 45, 'CLASSROOM'),
  (39, 'D52', 45, 'CLASSROOM'),
  (40, 'D53', 45, 'CLASSROOM'),
  (41, 'D54', 45, 'CLASSROOM'),
  (42, 'D55', 45, 'CLASSROOM');
INSERT INTO `teacher` (
    `id`,
    `lastName`,
    `firstName`,
    `phoneNumber`,
    `email`,
    `isDispense`,
    `departmentId`
  )
VALUES (1, 'AAROUD', '', '', '', 1, 1),
  (2, 'ABADA DRISS', '', '', '', 0, 1),
  (3, 'ABOUELMEHDI', '', '', '', 0, 1),
  (4, 'AIT ABDELOUAHAD', '', '', '', 0, 1),
  (5, 'BAHBOUHI', '', '', '', 0, 1),
  (6, 'BELLAMINE', '', '', '', 0, 1),
  (7, 'BENI-HSSANE', '', '', '', 0, 1),
  (8, 'BOUTKHOUM', '', '', '', 0, 1),
  (9, 'DAHMOUNI', '', '', '', 0, 1),
  (10, 'EL FAIK HANAN', '', '', '', 0, 1),
  (11, 'EL GUABASSI', '', '', '', 0, 1),
  (12, 'EL HOUSSEINI', '', '', '', 0, 1),
  (13, 'EL KAFI JAMAL', '', '', '', 0, 1),
  (14, 'EL MOHADAB', '', '', '', 0, 1),
  (15, 'EL MOUTAOUAKIL', '', '', '', 0, 1),
  (16, 'MADANI', '', '', '', 0, 1),
  (17, 'NABIL', '', '', '', 0, 1),
  (18, 'RIFFI', '', '', '', 0, 1),
  (19, 'SILKAN', '', '', '', 0, 1),
  (20, 'ALLAYL', '', '', '', 0, 7),
  (21, 'AMAL', '', '', '', 0, 7),
  (22, 'AZAMI RIM', '', '', '', 0, 7),
  (23, 'BAOUCH', '', '', '', 0, 7),
  (24, 'DAMOUS', '', '', '', 0, 7),
  (25, 'GUESSOUS', '', '', '', 0, 7),
  (26, 'LABRABICHE', '', '', '', 0, 7),
  (27, 'MIFDAL', '', '', '', 0, 7),
  (28, 'MOSTADI MOSTAFA', '', '', '', 0, 7),
  (29, 'NOUARI', '', '', '', 0, 7),
  (30, 'SENIHJI', '', '', '', 0, 7),
  (31, 'AGHZAR', '', '', '', 0, 6),
  (32, 'ALILOUCH', '', '', '', 0, 6),
  (33, 'BALOUKI S', '', '', '', 0, 6),
  (34, 'BELAHMIRA', '', '', '', 0, 6),
  (35, 'BENCHEKROUN', '', '', '', 0, 6),
  (36, 'BOUTAYEB', '', '', '', 0, 6),
  (37, 'CHARIF ABD', '', '', '', 0, 6),
  (38, 'DAKIR IBRAHIM', '', '', '', 0, 6),
  (39, 'EL ABASSI', '', '', '', 0, 6),
  (40, 'EL ACHHEB ABDR', '', '', '', 0, 6),
  (41, 'EL ARABI ABD', '', '', '', 0, 6),
  (42, 'EL HACHIMI', '', '', '', 0, 6),
  (43, 'EL HOUICHA', '', '', '', 0, 6),
  (44, 'EL KHALIDI', '', '', '', 0, 6),
  (45, 'EL MOSTADI', '', '', '', 0, 6),
  (46, 'ETTACHFINI', '', '', '', 0, 6),
  (47, 'EZZOUHAIRI', '', '', '', 0, 6),
  (48, 'FEKKAK', '', '', '', 0, 6),
  (49, 'GHARIB', '', '', '', 0, 6),
  (50, 'GUESSIR H', '', '', '', 0, 6),
  (51, 'HADANI', '', '', '', 0, 6),
  (52, 'IBNONAMER', '', '', '', 0, 6),
  (53, 'JOUHARI', '', '', '', 0, 6),
  (54, 'KHARIM M', '', '', '', 0, 6),
  (55, 'KHOLIQ', '', '', '', 0, 6),
  (56, 'NOUBHANI', '', '', '', 0, 6),
  (57, 'RAHIMI ABD', '', '', '', 0, 6),
  (58, 'RAHIMI MJ', '', '', '', 0, 6),
  (59, 'SAIDI', '', '', '', 0, 6),
  (60, 'SALHI', '', '', '', 0, 6),
  (61, 'SKAKNI', '', '', '', 0, 6),
  (62, 'SOUHEIL', '', '', '', 0, 6),
  (63, 'TOUFIQ', '', '', '', 0, 6),
  (64, 'ZOURARAH', '', '', '', 0, 6),
  (65, 'AAMILI', '', '', '', 0, 5),
  (66, 'ABALA', '', '', '', 0, 5),
  (67, 'ABOULAYT', '', '', '', 0, 5),
  (68, 'AGUNAOU MAHFOUD', '', '', '', 0, 5),
  (69, 'AIT SIR', '', '', '', 0, 5),
  (70, 'ALAMI', '', '', '', 0, 5),
  (71, 'ALAOUI BEL', '', '', '', 0, 5),
  (72, 'ALAOUI H', '', '', '', 0, 5),
  (73, 'ALAOUI I', '', '', '', 0, 5),
  (74, 'AMROUSSE', '', '', '', 0, 5),
  (75, 'BAKHOUCH', '', '', '', 0, 5),
  (76, 'BAKKALI', '', '', '', 0, 5),
  (77, 'BENALLOUM', '', '', '', 0, 5),
  (78, 'BENTISS', '', '', '', 0, 5),
  (79, 'BETTACH', '', '', '', 0, 5),
  (80, 'BOUDOUCH', '', '', '', 0, 5),
  (81, 'BRAHMI', '', '', '', 0, 5),
  (82, 'DAHBI M', '', '', '', 0, 5),
  (83, 'DAOUDI', '', '', '', 0, 5),
  (84, 'DEHBI OUSAMA', '', '', '', 0, 5),
  (85, 'DIOURI', '', '', '', 0, 5),
  (86, 'ECHHERKI', '', '', '', 0, 5),
  (87, 'EL AISSI', '', '', '', 0, 5),
  (88, 'EL HADRAMI', '', '', '', 0, 5),
  (89, 'ESSIFI', '', '', '', 0, 5),
  (90, 'FDIL', '', '', '', 0, 5),
  (91, 'FOUAD', '', '', '', 0, 5),
  (92, 'GHANJAOUI', '', '', '', 0, 5),
  (93, 'GUESMI', '', '', '', 0, 5),
  (94, 'HSISSOU RACHID', '', '', '', 0, 5),
  (95, 'JAAFARI', '', '', '', 0, 5),
  (96, 'JORIO', '', '', '', 0, 5),
  (97, 'LAACHIR', '', '', '', 0, 5),
  (98, 'LAHKEL', '', '', '', 0, 5),
  (99, 'LANCAR', '', '', '', 0, 5),
  (100, 'MAZOIR', '', '', '', 0, 5),
  (101, 'MOUJAHID', '', '', '', 0, 5),
  (102, 'MOUZDAHIR', '', '', '', 0, 5),
  (103, 'NOUHAIR', '', '', '', 0, 5),
  (104, 'OUZEBLA', '', '', '', 0, 5),
  (105, 'QAFSAOUI', '', '', '', 0, 5),
  (106, 'RAMDANE', '', '', '', 0, 5),
  (107, 'RICH', '', '', '', 0, 5),
  (108, 'SABBAR', '', '', '', 0, 5),
  (109, 'SADIK R', '', '', '', 0, 5),
  (110, 'SAHIBEDDINE', '', '', '', 0, 5),
  (111, 'SALAH', '', '', '', 0, 5),
  (112, 'SALHI ANAS', '', '', '', 0, 5),
  (113, 'SHAIMI', '', '', '', 0, 5),
  (114, 'SINITI', '', '', '', 0, 5),
  (115, 'SOUFIANE M', '', '', '', 0, 5),
  (116, 'SRAIDI KHADIJA', '', '', '', 0, 5),
  (117, 'TAHIRI S', '', '', '', 0, 5),
  (118, 'ZAKARIA', '', '', '', 0, 5),
  (119, 'ZARI RKIA', '', '', '', 0, 5),
  (120, 'ZEROUAL', '', '', '', 0, 5),
  (121, 'AMINE JAMAL', '', '', '', 0, 4),
  (122, 'ANAIBAR', '', '', '', 0, 4),
  (123, 'ARSALANE', '', '', '', 0, 4),
  (124, 'BAMHAOUD', '', '', '', 0, 4),
  (125, 'BELATTMANIA', '', '', '', 0, 4),
  (126, 'BELFAIZA', '', '', '', 0, 4),
  (127, 'BENYAHIA', '', '', '', 0, 4),
  (128, 'BITAR', '', '', '', 0, 4),
  (129, 'CHADDAD', '', '', '', 0, 4),
  (130, 'CHAOUITE', '', '', '', 0, 4),
  (131, 'CHAOUTI', '', '', '', 0, 4),
  (132, 'CHIAHOU', '', '', '', 0, 4),
  (133, 'CHOUL-LI', '', '', '', 0, 4),
  (134, 'DERDAKK', '', '', '', 0, 4),
  (135, 'EJJOUADAR A', '', '', '', 0, 4),
  (136, 'EL ADLOUNI', '', '', '', 0, 4),
  (137, 'EL HABAZI', '', '', '', 0, 4),
  (138, 'EL HIBA', '', '', '', 0, 4),
  (139, 'EL KHIARI', '', '', '', 0, 4),
  (140, 'EL MADIHI', '', '', '', 0, 4),
  (141, 'EL MALIKI FATIMA', '', '', '', 0, 4),
  (142, 'EL OTMANI', '', '', '', 0, 4),
  (143, 'EL RHILASSI', '', '', '', 0, 4),
  (144, 'ESSERTI', '', '', '', 0, 4),
  (145, 'ETTAHIRI', '', '', '', 0, 4),
  (146, 'FAIZ', '', '', '', 0, 4),
  (147, 'FARKACHA', '', '', '', 0, 4),
  (148, 'FERSIWI', '', '', '', 0, 4),
  (149, 'FGHIRE RACHID', '', '', '', 0, 4),
  (150, 'HARICH', '', '', '', 0, 4),
  (151, 'HMIMID', '', '', '', 0, 4),
  (152, 'IGGAR', '', '', '', 0, 4),
  (153, 'KADDOURI', '', '', '', 0, 4),
  (154, 'KHLIFI', '', '', '', 0, 4),
  (155, 'KOUSSA', '', '', '', 0, 4),
  (156, 'LAKHDAR', '', '', '', 0, 4),
  (157, 'LASKY', '', '', '', 0, 4),
  (158, 'LAYACHI', '', '', '', 0, 4),
  (159, 'MAISSOUR', '', '', '', 0, 4),
  (160, 'MAKROUM', '', '', '', 0, 4),
  (161, 'MARGHICH', '', '', '', 0, 4),
  (162, 'MOKHLISS', '', '', '', 0, 4),
  (163, 'MONCEF', '', '', '', 0, 4),
  (164, 'MOUNDIB', '', '', '', 0, 4),
  (165, 'MRICHA', '', '', '', 0, 4),
  (166, 'NAFIS', '', '', '', 0, 4),
  (167, 'RABHI', '', '', '', 0, 4),
  (168, 'REANI', '', '', '', 0, 4),
  (169, 'RIFAI Aicha', '', '', '', 0, 4),
  (170, 'RIFAI SAIDA', '', '', '', 0, 4),
  (171, 'RIHANI', '', '', '', 0, 4),
  (172, 'SIF', '', '', '', 0, 4),
  (173, 'TAHERI', '', '', '', 0, 4),
  (174, 'TALIB', '', '', '', 0, 4),
  (175, 'TALMI', '', '', '', 0, 4),
  (176, 'ZINEDINE', '', '', '', 0, 4),
  (177, 'AGUNAOU MUSTAPHA', '', '', '', 0, 3),
  (178, 'AMGHAR', '', '', '', 0, 3),
  (179, 'AMINE ABDELAZIZ', '', '', '', 0, 3),
  (180, 'AMRANE', '', '', '', 0, 3),
  (181, 'AOUTOUL', '', '', '', 0, 3),
  (182, 'ASSAID', '', '', '', 0, 3),
  (183, 'BAGHAZ', '', '', '', 0, 3),
  (184, 'BAHAOUI', '', '', '', 0, 3),
  (185, 'BELAASILIA', '', '', '', 0, 3),
  (186, 'BOUHSSA', '', '', '', 0, 3),
  (187, 'CHIB SALMA', '', '', '', 0, 3),
  (188, 'CHOUBABI', '', '', '', 0, 3),
  (189, 'CHQONDI', '', '', '', 0, 3),
  (190, 'DLIMI', '', '', '', 0, 3),
  (191, 'DOGHMI', '', '', '', 0, 3),
  (192, 'EL AFIF', '', '', '', 0, 3),
  (193, 'EL BOUZIANI', '', '', '', 0, 3),
  (194, 'EL FAJRI', '', '', '', 0, 3),
  (195, 'EL FALAKI', '', '', '', 0, 3),
  (196, 'EL HAJIBI', '', '', '', 0, 3),
  (197, 'EL HAMRI', '', '', '', 0, 3),
  (198, 'EL JOUAD', '', '', '', 0, 3),
  (199, 'EL KAMOUN', '', '', '', 0, 3),
  (200, 'EL KHADIRI', '', '', '', 0, 3),
  (201, 'EL MELOUKY', '', '', '', 0, 3),
  (202, 'EL MOZNINE R', '', '', '', 0, 3),
  (203, 'ERRAMI YOUSSEF', '', '', '', 0, 3),
  (204, 'FAHAD', '', '', '', 0, 3),
  (205, 'FOUAIDI MUSTAPHA', '', '', '', 0, 3),
  (206, 'GHAOUACH', '', '', '', 0, 3),
  (207, 'HACHEM', '', '', '', 0, 3),
  (208, 'HAKIM', '', '', '', 0, 3),
  (209, 'HRICHA', '', '', '', 0, 3),
  (210, 'HOUSSA', '', '', '', 0, 3),
  (211, 'JELLAL', '', '', '', 0, 3),
  (212, 'KHANNOUS', '', '', '', 0, 3),
  (213, 'KHOUKH', '', '', '', 0, 3),
  (214, 'LAAMYEM', '', '', '', 0, 3),
  (215, 'LABOUIDYA O', '', '', '', 0, 3),
  (216, 'LAGHDAS', '', '', '', 0, 3),
  (217, 'MAJID', '', '', '', 0, 3),
  (218, 'MIKDAM', '', '', '', 0, 3),
  (219, 'MISKANE', '', '', '', 0, 3),
  (220, 'MONKADE M', '', '', '', 0, 3),
  (221, 'NEBDI', '', '', '', 0, 3),
  (222, 'OBADDI', '', '', '', 0, 3),
  (223, 'OUIDA ABD', '', '', '', 0, 3),
  (224, 'QJANI M', '', '', '', 0, 3),
  (225, 'RMAILI R', '', '', '', 0, 3),
  (226, 'SABRI K', '', '', '', 0, 3),
  (227, 'SAHNOUN S', '', '', '', 0, 3),
  (228, 'TOUNSI Y', '', '', '', 0, 3),
  (229, 'AHAMMOU ABDELA', '', '', '', 0, 2),
  (230, 'AIMANI RABIA', '', '', '', 0, 2),
  (231, 'ALEHYANE OMAR', '', '', '', 0, 2),
  (232, 'AMOUCH', '', '', '', 0, 2),
  (233, 'AMZILI H', '', '', '', 0, 2),
  (234, 'EL-BAKKALI', '', '', '', 0, 2),
  (235, 'BALATIF', '', '', '', 0, 2),
  (236, 'BARKATOU', '', '', '', 0, 2),
  (237, 'BENCHIHEB', '', '', '', 0, 2),
  (238, 'BENIICH', '', '', '', 0, 2),
  (239, 'BENZAKOUR', '', '', '', 0, 2),
  (240, 'BENZEKRI FATIH', '', '', '', 0, 2),
  (241, 'BOULBOT', '', '', '', 0, 2),
  (242, 'EL AZHAR HAMZA', '', '', '', 0, 2),
  (243, 'EL BADRY', '', '', '', 0, 2),
  (244, 'EL BOUHTOURI', '', '', '', 0, 2),
  (245, 'EL HADRI K', '', '', '', 0, 2),
  (246, 'EL HARFAOUI', '', '', '', 0, 2),
  (247, 'EL HOUSSIF', '', '', '', 0, 2),
  (248, 'EL KIMAKH K', '', '', '', 0, 2),
  (249, 'EL MOUMNI', '', '', '', 0, 2),
  (250, 'ESSAOUINI', '', '', '', 0, 2),
  (251, 'FADLI', '', '', '', 0, 2),
  (252, 'FAOUZI', '', '', '', 0, 2),
  (253, 'GABIH', '', '', '', 0, 2),
  (254, 'GHOSN', '', '', '', 0, 2),
  (255, 'HAILY', '', '', '', 0, 2),
  (256, 'KHATMI SAMIRA', '', '', '', 0, 2),
  (257, 'LAABISSI', '', '', '', 0, 2),
  (258, 'LABANI H', '', '', '', 0, 2),
  (259, 'LAHRACHE', '', '', '', 0, 2),
  (260, 'MASRAR', '', '', '', 0, 2),
  (261, 'MOUCOUF', '', '', '', 0, 2),
  (262, 'ERRAOUI', '', '', '', 0, 2),
  (263, 'SAADALLAH', '', '', '', 0, 2),
  (264, 'SERHIR', '', '', '', 0, 2),
  (265, 'SOUHAR', '', '', '', 0, 2),
  (266, 'ZIANE', '', '', '', 0, 2),
  (267, 'ZOUAKI', '', '', '', 0, 2),
  (268, 'ZRID', '', '', '', 0, 4);
INSERT INTO `user` (`id`, `name`, `email`, `password`, `isAdmin`)
VALUES (
    1,
    'admin',
    'admin@ucd.ac.ma',
    '$2a$10$6CZQVRylKbcN.cZqSJphYul7bWAEucb3JAeAV4iJ/DPcMiMhvKhlO',
    1
  );