CREATE TABLE `user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`email` varchar(50) NOT NULL,
	`emailVerified` timestamp,
	`password` varchar(100) NOT NULL,
	`image` varchar(100),
	`isAdmin` boolean NOT NULL DEFAULT false,
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
