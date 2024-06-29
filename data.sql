CREATE TABLE `department` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	CONSTRAINT `department_id` PRIMARY KEY(`id`)
) Engine = InnoDB;

CREATE TABLE `exam` (
	`id` int AUTO_INCREMENT NOT NULL,
	`module` varchar(20) NOT NULL,
	`option` varchar(20) NOT NULL,
	`timeSlotId` int NOT NULL,
	`responsibleId` int NOT NULL,
	CONSTRAINT `exam_id` PRIMARY KEY(`id`)
) Engine = InnoDB;

CREATE TABLE `location` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`size` int NOT NULL,
	`type` enum('CLASSROOM','AMPHITHEATER') NOT NULL,
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

ALTER TABLE `exam` ADD CONSTRAINT `exam_module_module_id_fk` FOREIGN KEY (`module`) REFERENCES `module`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `exam` ADD CONSTRAINT `exam_option_option_id_fk` FOREIGN KEY (`option`) REFERENCES `option`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `exam` ADD CONSTRAINT `exam_timeSlotId_timeSlot_id_fk` FOREIGN KEY (`timeSlotId`) REFERENCES `timeSlot`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `exam` ADD CONSTRAINT `exam_responsibleId_teacher_id_fk` FOREIGN KEY (`responsibleId`) REFERENCES `teacher`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `moduleOption` ADD CONSTRAINT `moduleOption_moduleId_module_id_fk` FOREIGN KEY (`moduleId`) REFERENCES `module`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `moduleOption` ADD CONSTRAINT `moduleOption_optionId_option_id_fk` FOREIGN KEY (`optionId`) REFERENCES `option`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `monitoring` ADD CONSTRAINT `monitoring_examId_exam_id_fk` FOREIGN KEY (`examId`) REFERENCES `exam`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `monitoring` ADD CONSTRAINT `monitoring_locationId_location_id_fk` FOREIGN KEY (`locationId`) REFERENCES `location`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `monitoringLine` ADD CONSTRAINT `monitoringLine_teacherId_teacher_id_fk` FOREIGN KEY (`teacherId`) REFERENCES `teacher`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `monitoringLine` ADD CONSTRAINT `monitoringLine_monitoringId_monitoring_id_fk` FOREIGN KEY (`monitoringId`) REFERENCES `monitoring`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `occupiedLocation` ADD CONSTRAINT `occupiedLocation_locationId_location_id_fk` FOREIGN KEY (`locationId`) REFERENCES `location`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `occupiedLocation` ADD CONSTRAINT `occupiedLocation_timeSlotId_timeSlot_id_fk` FOREIGN KEY (`timeSlotId`) REFERENCES `timeSlot`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `occupiedTeacher` ADD CONSTRAINT `occupiedTeacher_teacherId_teacher_id_fk` FOREIGN KEY (`teacherId`) REFERENCES `teacher`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `occupiedTeacher` ADD CONSTRAINT `occupiedTeacher_timeSlotId_timeSlot_id_fk` FOREIGN KEY (`timeSlotId`) REFERENCES `timeSlot`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `student` ADD CONSTRAINT `student_sessionExamId_sessionExam_id_fk` FOREIGN KEY (`sessionExamId`) REFERENCES `sessionExam`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `student` ADD CONSTRAINT `student_moduleId_module_id_fk` FOREIGN KEY (`moduleId`) REFERENCES `module`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `student` ADD CONSTRAINT `student_optionId_option_id_fk` FOREIGN KEY (`optionId`) REFERENCES `option`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `studentExamLocation` ADD CONSTRAINT `studentExamLocation_locationId_location_id_fk` FOREIGN KEY (`locationId`) REFERENCES `location`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `studentExamLocation` ADD CONSTRAINT `studentExamLocation_examId_exam_id_fk` FOREIGN KEY (`examId`) REFERENCES `exam`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `teacher` ADD CONSTRAINT `teacher_departmentId_department_id_fk` FOREIGN KEY (`departmentId`) REFERENCES `department`(`id`) ON DELETE cascade ON UPDATE cascade;
ALTER TABLE `timeSlot` ADD CONSTRAINT `timeSlot_sessionExamId_sessionExam_id_fk` FOREIGN KEY (`sessionExamId`) REFERENCES `sessionExam`(`id`) ON DELETE cascade ON UPDATE cascade;


INSERT INTO `department` (`id`, `name`) VALUES
(1, 'Informatique'),
(2, 'Mathématiques'),
(3, 'Physique'),
(4, 'Biologie'),
(5, 'Chimie'),
(6, 'Géologie'),
(7, 'Langue');


INSERT INTO `location` (`id`, `name`, `size`, `type`) VALUES
(1, 'NO', 100, 'AMPHITHEATER'),
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


INSERT INTO `teacher` (`id`, `lastName`, `firstName`, `phoneNumber`, `email`, `isDispense`, `departmentId`) VALUES
(1, 'BALOUKI S', '', '', '', 0, 6),
(2, 'EL HABAZI', '', '', '', 0, 4),
(3, 'SALHI ANAS', '', '', '', 0, 5),
(4, 'BOUHSSA', '', '', '', 0, 3),
(5, 'AMOUCH', '', '', '', 0, 2),
(6, 'ABOULAYT', '', '', '', 0, 5),
(7, 'EL BOUZIANI', '', '', '', 0, 3),
(8, 'SABRI K', '', '', '', 0, 3),
(9, 'RABHI', '', '', '', 0, 4),
(10, 'RAHIMI MJ', '', '', '', 0, 6),
(11, 'EL HADRAMI', '', '', '', 0, 5),
(12, 'GUESSIR H', '', '', '', 0, 6),
(13, 'BENTISS', '', '', '', 0, 5),
(14, 'ZAKARIA', '', '', '', 0, 5),
(15, 'EL RHILASSI', '', '', '', 0, 4),
(16, 'DOGHMI', '', '', '', 0, 3),
(17, 'NOUBHANI', '', '', '', 0, 6),
(18, 'BAKKALI', '', '', '', 0, 5),
(19, 'SOUFIANE M', '', '', '', 0, 5),
(20, 'OUZEBLA', '', '', '', 0, 5),
(21, 'EL KHIARI', '', '', '', 0, 4),
(22, 'BELLAMINE', '', '', '', 0, 1),
(23, 'EL ADLOUNI', '', '', '', 0, 4),
(24, 'EL ABASSI', '', '', '', 0, 6),
(25, 'FERSIWI', '', '', '', 0, 4),
(26, 'MONKADE M', '', '', '', 0, 3),
(27, 'AIT SIR', '', '', '', 0, 5),
(28, 'JAAFARI', '', '', '', 0, 5),
(29, 'BENCHEKROUN', '', '', '', 0, 6),
(30, 'NEBDI', '', '', '', 0, 3),
(31, 'SOUHEIL', '', '', '', 0, 6),
(32, 'KHARIM M', '', '', '', 0, 6),
(33, 'ALAOUI H', '', '', '', 0, 5),
(34, 'EL KHADIRI', '', '', '', 0, 3),
(35, 'ZIANE', '', '', '', 0, 2),
(36, 'TALMI', '', '', '', 0, 4),
(37, 'ARSALANE', '', '', '', 0, 4),
(38, 'AZAMI RIM', '', '', '', 0, 7),
(39, 'GUESMI', '', '', '', 0, 5),
(40, 'EL HACHIMI', '', '', '', 0, 6),
(41, 'KHOLIQ', '', '', '', 0, 6),
(42, 'AOUTOUL', '', '', '', 0, 3),
(43, 'NOUHAIR', '', '', '', 0, 5),
(44, 'EL FAIK HANAN', '', '', '', 0, 1),
(45, 'SERHIR', '', '', '', 0, 2),
(46, 'BOULBOT', '', '', '', 0, 2),
(47, 'EL GUABASSI', '', '', '', 0, 1),
(48, 'EL KAFI JAMAL', '', '', '', 0, 1),
(49, 'HOUSSA', '', '', '', 0, 3),
(50, 'ECHHERKI', '', '', '', 0, 5),
(51, 'HACHEM', '', '', '', 0, 3),
(52, 'EL ACHHEB ABDR', '', '', '', 0, 6),
(53, 'BAMHAOUD', '', '', '', 0, 4),
(54, 'FEKKAK', '', '', '', 0, 6),
(55, 'AIT ABDELOUAHAD', '', '', '', 0, 1),
(56, 'AMZILI H', '', '', '', 0, 2),
(57, 'MAJID', '', '', '', 0, 3),
(58, 'EL JOUAD', '', '', '', 0, 3),
(59, 'EL AISSI', '', '', '', 0, 5),
(60, 'MOUZDAHIR', '', '', '', 0, 5),
(61, 'EL OTMANI', '', '', '', 0, 4),
(62, 'ABOUELMEHDI', '', '', '', 0, 1),
(63, 'ZARI RKIA', '', '', '', 0, 5),
(64, 'LAHKEL', '', '', '', 0, 5),
(65, 'AMINE JAMAL', '', '', '', 0, 4),
(66, 'AGHZAR', '', '', '', 0, 6),
(67, 'LAACHIR', '', '', '', 0, 5),
(68, 'FAOUZI', '', '', '', 0, 2),
(69, 'LAKHDAR', '', '', '', 0, 4),
(70, 'SHAIMI', '', '', '', 0, 5),
(71, 'ZOUAKI', '', '', '', 0, 2),
(72, 'NABIL', '', '', '', 0, 1),
(73, 'TAHERI', '', '', '', 0, 4),
(74, 'QJANI M', '', '', '', 0, 3),
(75, 'JOUHARI', '', '', '', 0, 6),
(76, 'GHOSN', '', '', '', 0, 2),
(77, 'MOKHLISS', '', '', '', 0, 4),
(78, 'EL KIMAKH K', '', '', '', 0, 2),
(79, 'EL BADRY', '', '', '', 0, 2),
(80, 'ALEHYANE OMAR', '', '', '', 0, 2),
(81, 'JORIO', '', '', '', 0, 5),
(82, 'TAHIRI S', '', '', '', 0, 5),
(83, 'RAMDANE', '', '', '', 0, 5),
(84, 'IGGAR', '', '', '', 0, 4),
(85, 'KHOUKH', '', '', '', 0, 3),
(86, 'RMAILI R', '', '', '', 0, 3),
(87, 'GHARIB', '', '', '', 0, 6),
(88, 'SALHI', '', '', '', 0, 6),
(89, 'EL MOHADAB', '', '', '', 0, 1),
(90, 'LAHRACHE', '', '', '', 0, 2),
(91, 'MARGHICH', '', '', '', 0, 4),
(92, 'HARICH', '', '', '', 0, 4),
(93, 'MISKANE', '', '', '', 0, 3),
(94, 'MAISSOUR', '', '', '', 0, 4),
(95, 'SALAH', '', '', '', 0, 5),
(96, 'EL HARFAOUI', '', '', '', 0, 2),
(97, 'FADLI', '', '', '', 0, 2),
(98, 'LAAMYEM', '', '', '', 0, 3),
(99, 'MOUJAHID', '', '', '', 0, 5),
(100, 'AMGHAR', '', '', '', 0, 3),
(101, 'SOUHAR', '', '', '', 0, 2),
(102, 'FGHIRE RACHID', '', '', '', 0, 4),
(103, 'EL BOUHTOURI', '', '', '', 0, 2),
(104, 'SRAIDI KHADIJA', '', '', '', 0, 5),
(105, 'BETTACH', '', '', '', 0, 5),
(106, 'BOUDOUCH', '', '', '', 0, 5),
(107, 'DEHBI OUSAMA', '', '', '', 0, 5),
(108, 'EL-BAKKALI', '', '', '', 0, 2),
(109, 'RICH', '', '', '', 0, 5),
(110, 'RIFAI Aicha', '', '', '', 0, 4),
(111, 'EL MOZNINE R', '', '', '', 0, 3),
(112, 'SIF', '', '', '', 0, 4),
(113, 'MRICHA', '', '', '', 0, 4),
(114, 'ZINEDINE', '', '', '', 0, 4),
(115, 'RAHIMI ABD', '', '', '', 0, 6),
(116, 'KHATMI SAMIRA', '', '', '', 0, 2),
(117, 'RIFFI', '', '', '', 0, 1),
(118, 'RIHANI', '', '', '', 0, 4),
(119, 'LABOUIDYA O', '', '', '', 0, 3),
(120, 'AMRANE', '', '', '', 0, 3),
(121, 'SILKAN', '', '', '', 0, 1),
(122, 'ASSAID', '', '', '', 0, 3),
(123, 'EL MOSTADI', '', '', '', 0, 6),
(124, 'AMINE ABDELAZIZ', '', '', '', 0, 3),
(125, 'LASKY', '', '', '', 0, 4),
(126, 'NOUARI', '', '', '', 0, 7),
(127, 'MAZOIR', '', '', '', 0, 5),
(128, 'ANAIBAR', '', '', '', 0, 4),
(129, 'EL FAJRI', '', '', '', 0, 3),
(130, 'LAGHDAS', '', '', '', 0, 3),
(131, 'SABBAR', '', '', '', 0, 5),
(132, 'BITAR', '', '', '', 0, 4),
(133, 'DIOURI', '', '', '', 0, 5),
(134, 'DAOUDI', '', '', '', 0, 5),
(135, 'BENI-HSSANE', '', '', '', 0, 1),
(136, 'BELFAIZA', '', '', '', 0, 4),
(137, 'BENALLOUM', '', '', '', 0, 5),
(138, 'CHIB SALMA', '', '', '', 0, 3),
(139, 'CHARIF ABD', '', '', '', 0, 6),
(140, 'BELAHMIRA', '', '', '', 0, 6),
(141, 'AIMANI RABIA', '', '', '', 0, 2),
(142, 'ALAMI', '', '', '', 0, 5),
(143, 'BENCHIHEB', '', '', '', 0, 2),
(144, 'DAHBI M', '', '', '', 0, 5),
(145, 'SINITI', '', '', '', 0, 5),
(146, 'KOUSSA', '', '', '', 0, 4),
(147, 'EZZOUHAIRI', '', '', '', 0, 6),
(148, 'HADANI', '', '', '', 0, 6),
(149, 'MOUCOUF', '', '', '', 0, 2),
(150, 'ABALA', '', '', '', 0, 5),
(151, 'OBADDI', '', '', '', 0, 3),
(152, 'FARKACHA', '', '', '', 0, 4),
(153, 'ETTACHFINI', '', '', '', 0, 6),
(154, 'KHANNOUS', '', '', '', 0, 3),
(155, 'CHOUL-LI', '', '', '', 0, 4),
(156, 'SAHIBEDDINE', '', '', '', 0, 5),
(157, 'GABIH', '', '', '', 0, 2),
(158, 'AAROUD', '', '', '', 1, 1),
(159, 'MOSTADI MOSTAFA', '', '', '', 0, 7),
(160, 'DAKIR IBRAHIM', '', '', '', 0, 6),
(161, 'ZRID', '', '', '', 0, 4),
(162, 'SADIK R', '', '', '', 0, 5),
(163, 'LAABISSI', '', '', '', 0, 2),
(164, 'KHLIFI', '', '', '', 0, 4),
(165, 'AAMILI', '', '', '', 0, 5),
(166, 'QAFSAOUI', '', '', '', 0, 5),
(167, 'BAGHAZ', '', '', '', 0, 3),
(168, 'CHQONDI', '', '', '', 0, 3),
(169, 'NAFIS', '', '', '', 0, 4),
(170, 'BAOUCH', '', '', '', 0, 7),
(171, 'BRAHMI', '', '', '', 0, 5),
(172, 'CHOUBABI', '', '', '', 0, 3),
(173, 'CHAOUTI', '', '', '', 0, 4),
(174, 'HRICHA', '', '', '', 0, 3),
(175, 'BOUTKHOUM', '', '', '', 0, 1),
(176, 'ALILOUCH', '', '', '', 0, 6),
(177, 'ESSAOUINI', '', '', '', 0, 2),
(178, 'LABANI H', '', '', '', 0, 2),
(179, 'TOUFIQ', '', '', '', 0, 6),
(180, 'EL HIBA', '', '', '', 0, 4),
(181, 'ALLAYL', '', '', '', 0, 7),
(182, 'BELATTMANIA', '', '', '', 0, 4),
(183, 'ESSIFI', '', '', '', 0, 5),
(184, 'TALIB', '', '', '', 0, 4),
(185, 'EL MALIKI FATIMA', '', '', '', 0, 4),
(186, 'CHAOUITE', '', '', '', 0, 4),
(187, 'BENZAKOUR', '', '', '', 0, 2),
(188, 'CHADDAD', '', '', '', 0, 4),
(189, 'MOUNDIB', '', '', '', 0, 4),
(190, 'GUESSOUS', '', '', '', 0, 7),
(191, 'SENIHJI', '', '', '', 0, 7),
(192, 'EL ARABI ABD', '', '', '', 0, 6),
(193, 'ESSERTI', '', '', '', 0, 4),
(194, 'BAHAOUI', '', '', '', 0, 3),
(195, 'DLIMI', '', '', '', 0, 3),
(196, 'IBNONAMER', '', '', '', 0, 6),
(197, 'FOUAD', '', '', '', 0, 5),
(198, 'CHIAHOU', '', '', '', 0, 4),
(199, 'FOUAIDI MUSTAPHA', '', '', '', 0, 3),
(200, 'DAMOUS', '', '', '', 0, 7),
(201, 'SAIDI', '', '', '', 0, 6),
(202, 'MIKDAM', '', '', '', 0, 3),
(203, 'HAKIM', '', '', '', 0, 3),
(204, 'ABADA DRISS', '', '', '', 0, 1),
(205, 'HMIMID', '', '', '', 0, 4),
(206, 'GHAOUACH', '', '', '', 0, 3),
(207, 'EL HAMRI', '', '', '', 0, 3),
(208, 'RIFAI SAIDA', '', '', '', 0, 4),
(209, 'BARKATOU', '', '', '', 0, 2),
(210, 'AMROUSSE', '', '', '', 0, 5),
(211, 'FAHAD', '', '', '', 0, 3),
(212, 'FDIL', '', '', '', 0, 5),
(213, 'EL AFIF', '', '', '', 0, 3),
(214, 'ZOURARAH', '', '', '', 0, 6),
(215, 'BOUTAYEB', '', '', '', 0, 6),
(216, 'TOUNSI Y', '', '', '', 0, 3),
(217, 'HAILY', '', '', '', 0, 2),
(218, 'EL KAMOUN', '', '', '', 0, 3),
(219, 'DERDAKK', '', '', '', 0, 4),
(220, 'EL HOUSSEINI', '', '', '', 0, 1),
(221, 'AHAMMOU ABDELA', '', '', '', 0, 2),
(222, 'ERRAOUI', '', '', '', 0, 2),
(223, 'EL KHALIDI', '', '', '', 0, 6),
(224, 'KADDOURI', '', '', '', 0, 4),
(225, 'LANCAR', '', '', '', 0, 5),
(226, 'ETTAHIRI', '', '', '', 0, 4),
(227, 'BALATIF', '', '', '', 0, 2),
(228, 'BENZEKRI FATIH', '', '', '', 0, 2),
(229, 'EL HOUSSIF', '', '', '', 0, 2),
(230, 'ERRAMI YOUSSEF', '', '', '', 0, 3),
(231, 'AMAL', '', '', '', 0, 7),
(232, 'EL MELOUKY', '', '', '', 0, 3),
(233, 'BENYAHIA', '', '', '', 0, 4),
(234, 'EL HAJIBI', '', '', '', 0, 3),
(235, 'DAHMOUNI', '', '', '', 0, 1),
(236, 'MIFDAL', '', '', '', 0, 7),
(237, 'EL MOUMNI', '', '', '', 0, 2),
(238, 'EL HOUICHA', '', '', '', 0, 6),
(239, 'EL MADIHI', '', '', '', 0, 4),
(240, 'GHANJAOUI', '', '', '', 0, 5),
(241, 'ALAOUI I', '', '', '', 0, 5),
(242, 'JELLAL', '', '', '', 0, 3),
(243, 'HSISSOU RACHID', '', '', '', 0, 5),
(244, 'EL FALAKI', '', '', '', 0, 3),
(245, 'EL AZHAR HAMZA', '', '', '', 0, 2),
(246, 'BENIICH', '', '', '', 0, 2),
(247, 'BELAASILIA', '', '', '', 0, 3),
(248, 'ALAOUI BEL', '', '', '', 0, 5),
(249, 'SAADALLAH', '', '', '', 0, 2),
(250, 'OUIDA ABD', '', '', '', 0, 3),
(251, 'SKAKNI', '', '', '', 0, 6),
(252, 'MAKROUM', '', '', '', 0, 4),
(253, 'EL HADRI K', '', '', '', 0, 2),
(254, 'LAYACHI', '', '', '', 0, 4),
(255, 'REANI', '', '', '', 0, 4),
(256, 'BAKHOUCH', '', '', '', 0, 5),
(257, 'LABRABICHE', '', '', '', 0, 7),
(258, 'AGUNAOU MAHFOUD', '', '', '', 0, 5),
(259, 'MADANI', '', '', '', 0, 1),
(260, 'SAHNOUN S', '', '', '', 0, 3),
(261, 'EJJOUADAR A', '', '', '', 0, 4),
(262, 'FAIZ', '', '', '', 0, 4),
(263, 'BAHBOUHI', '', '', '', 0, 1),
(264, 'EL MOUTAOUAKIL', '', '', '', 0, 1),
(265, 'MONCEF', '', '', '', 0, 4),
(266, 'MASRAR', '', '', '', 0, 2),
(267, 'AGUNAOU MUSTAPHA', '', '', '', 0, 3),
(268, 'ZEROUAL', '', '', '', 0, 5);



INSERT INTO `user` (`id`, `name`, `email`, `password`, `isAdmin`) VALUES
(1, 'admin', 'admin@ucd.ac.ma', '$2a$10$6CZQVRylKbcN.cZqSJphYul7bWAEucb3JAeAV4iJ/DPcMiMhvKhlO', 1);

