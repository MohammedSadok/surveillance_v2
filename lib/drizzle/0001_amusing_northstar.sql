ALTER TABLE `module` DROP PRIMARY KEY;--> statement-breakpoint
ALTER TABLE `module` ADD PRIMARY KEY(`id`,`optionId`);