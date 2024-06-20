DO $$ BEGIN
 CREATE TYPE "public"."RoomType" AS ENUM('CLASSROOM', 'AMPHITHEATER');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "department" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "exam" (
	"id" serial PRIMARY KEY NOT NULL,
	"module" varchar(20) NOT NULL,
	"timeSlotId" serial NOT NULL,
	"responsibleId" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "location" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"size" serial NOT NULL,
	"RoomType" "RoomType" NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "moduleOption" (
	"id" serial PRIMARY KEY NOT NULL,
	"moduleId" varchar(20) NOT NULL,
	"optionId" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "module" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "monitoring" (
	"id" serial PRIMARY KEY NOT NULL,
	"examId" serial NOT NULL,
	"locationId" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "monitoringLine" (
	"id" serial PRIMARY KEY NOT NULL,
	"teacherId" serial NOT NULL,
	"monitoringId" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "occupiedLocation" (
	"id" serial PRIMARY KEY NOT NULL,
	"cause" varchar(50) NOT NULL,
	"locationId" serial NOT NULL,
	"timeSlotId" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "occupiedTeacher" (
	"id" serial PRIMARY KEY NOT NULL,
	"cause" varchar(50) NOT NULL,
	"teacherId" serial NOT NULL,
	"timeSlotId" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "option" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"name" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessionExam" (
	"id" serial PRIMARY KEY NOT NULL,
	"isValidated" boolean DEFAULT false NOT NULL,
	"type" varchar(50) NOT NULL,
	"startDate" date NOT NULL,
	"endDate" date NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "student" (
	"id" serial PRIMARY KEY NOT NULL,
	"cne" varchar(20) NOT NULL,
	"firstName" varchar(50) NOT NULL,
	"lastName" varchar(50) NOT NULL,
	"sessionExamId" serial NOT NULL,
	"moduleId" varchar(20) NOT NULL,
	"optionId" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "studentExamLocation" (
	"id" serial PRIMARY KEY NOT NULL,
	"cne" varchar(20) NOT NULL,
	"numberOfStudent" serial NOT NULL,
	"locationId" serial NOT NULL,
	"examId" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "teacher" (
	"id" serial PRIMARY KEY NOT NULL,
	"lastName" varchar(50) NOT NULL,
	"firstName" varchar(50) NOT NULL,
	"phoneNumber" varchar(15) NOT NULL,
	"email" varchar(50) NOT NULL,
	"isDispense" boolean DEFAULT false NOT NULL,
	"departmentId" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "timeSlot" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" date NOT NULL,
	"period" varchar(20) NOT NULL,
	"timePeriod" varchar(20) NOT NULL,
	"sessionExamId" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(50) NOT NULL,
	"password" varchar(100) NOT NULL,
	"isAdmin" boolean DEFAULT false NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exam" ADD CONSTRAINT "exam_module_module_id_fk" FOREIGN KEY ("module") REFERENCES "public"."module"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exam" ADD CONSTRAINT "exam_timeSlotId_timeSlot_id_fk" FOREIGN KEY ("timeSlotId") REFERENCES "public"."timeSlot"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "exam" ADD CONSTRAINT "exam_responsibleId_teacher_id_fk" FOREIGN KEY ("responsibleId") REFERENCES "public"."teacher"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moduleOption" ADD CONSTRAINT "moduleOption_moduleId_module_id_fk" FOREIGN KEY ("moduleId") REFERENCES "public"."module"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "moduleOption" ADD CONSTRAINT "moduleOption_optionId_option_id_fk" FOREIGN KEY ("optionId") REFERENCES "public"."option"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "monitoring" ADD CONSTRAINT "monitoring_examId_exam_id_fk" FOREIGN KEY ("examId") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "monitoring" ADD CONSTRAINT "monitoring_locationId_location_id_fk" FOREIGN KEY ("locationId") REFERENCES "public"."location"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "monitoringLine" ADD CONSTRAINT "monitoringLine_teacherId_teacher_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."teacher"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "monitoringLine" ADD CONSTRAINT "monitoringLine_monitoringId_monitoring_id_fk" FOREIGN KEY ("monitoringId") REFERENCES "public"."monitoring"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "occupiedLocation" ADD CONSTRAINT "occupiedLocation_locationId_location_id_fk" FOREIGN KEY ("locationId") REFERENCES "public"."location"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "occupiedLocation" ADD CONSTRAINT "occupiedLocation_timeSlotId_timeSlot_id_fk" FOREIGN KEY ("timeSlotId") REFERENCES "public"."timeSlot"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "occupiedTeacher" ADD CONSTRAINT "occupiedTeacher_teacherId_teacher_id_fk" FOREIGN KEY ("teacherId") REFERENCES "public"."teacher"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "occupiedTeacher" ADD CONSTRAINT "occupiedTeacher_timeSlotId_timeSlot_id_fk" FOREIGN KEY ("timeSlotId") REFERENCES "public"."timeSlot"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student" ADD CONSTRAINT "student_sessionExamId_sessionExam_id_fk" FOREIGN KEY ("sessionExamId") REFERENCES "public"."sessionExam"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student" ADD CONSTRAINT "student_moduleId_module_id_fk" FOREIGN KEY ("moduleId") REFERENCES "public"."module"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "student" ADD CONSTRAINT "student_optionId_option_id_fk" FOREIGN KEY ("optionId") REFERENCES "public"."option"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "studentExamLocation" ADD CONSTRAINT "studentExamLocation_locationId_location_id_fk" FOREIGN KEY ("locationId") REFERENCES "public"."location"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "studentExamLocation" ADD CONSTRAINT "studentExamLocation_examId_exam_id_fk" FOREIGN KEY ("examId") REFERENCES "public"."exam"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "teacher" ADD CONSTRAINT "teacher_departmentId_department_id_fk" FOREIGN KEY ("departmentId") REFERENCES "public"."department"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "timeSlot" ADD CONSTRAINT "timeSlot_sessionExamId_sessionExam_id_fk" FOREIGN KEY ("sessionExamId") REFERENCES "public"."sessionExam"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
