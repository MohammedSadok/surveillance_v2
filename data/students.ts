"use server";
import { db } from "@/lib/config";
import {
  locationTable,
  LocationType,
  moduleOption,
  moduleTable,
  ModuleType,
  monitoring,
  Option,
  option,
  student,
  studentExamLocation,
  StudentType,
  timeSlot,
} from "@/lib/schema";
import { GroupedData } from "@/lib/utils";
import { and, eq } from "drizzle-orm";

export const insertStudents = async (students: Omit<StudentType, "id">[]) => {
  await db.insert(student).values(students);
};

export const insertOption = async (newOption: Option) => {
  await db.insert(option).values(newOption);
};

export const insertModule = async (newModule: ModuleType) => {
  await db.insert(moduleTable).values(newModule);
};

export const getStudents = async (
  sessionExamId: number
): Promise<StudentType[]> => {
  const result = await db
    .select()
    .from(student)
    .where(eq(student.sessionExamId, sessionExamId));
  return result;
};

export const getStudentsInOptionAndModule = async (
  optionId: string,
  moduleId: string,
  sessionExamId: number
) => {
  const result = await db
    .select()
    .from(student)
    .where(
      and(
        eq(student.optionId, optionId),
        eq(student.moduleId, moduleId),
        eq(student.sessionExamId, sessionExamId)
      )
    );
  return result;
};

export const getModuleById = async (id: string) => {
  const result = await db.query.moduleTable.findFirst({
    where: and(eq(moduleTable.id, id)),
  });
  return result || null;
};

export const getModuleInOption = async (moduleId: string, optionId: string) => {
  const result = await db.query.moduleOption.findFirst({
    where: and(
      eq(moduleOption.moduleId, moduleId),
      eq(moduleOption.optionId, optionId)
    ),
  });
  return result || null;
};

export const getOptionById = async (id: string) => {
  const result = await db.query.option.findFirst({
    where: eq(option.id, id),
  });
  return result || null;
};
export const insertOptionsAndModules = async (
  optionsAndModules: GroupedData
) => {
  for (const optionId in optionsAndModules) {
    if (optionsAndModules.hasOwnProperty(optionId)) {
      const existOption = await getOptionById(optionId);
      if (!existOption) {
        await insertOption({
          id: optionId,
          name: optionsAndModules[optionId].name,
        });
      }
      for (const moduleId in optionsAndModules[optionId].modules) {
        if (optionsAndModules[optionId].modules.hasOwnProperty(moduleId)) {
          const existModule = await getModuleById(moduleId);
          if (!existModule) {
            await insertModule({
              id: moduleId,
              name: optionsAndModules[optionId].modules[moduleId].name,
            });
          }
          const existModuleInOption = await getModuleInOption(
            moduleId,
            optionId
          );
          if (!existModuleInOption) {
            await db.insert(moduleOption).values({ moduleId, optionId });
          }
        }
      }
    }
  }
};

export const insertStudentsChunk = async (
  students: Omit<StudentType, "id">[],
  sessionExamId: number
) => {
  await insertStudents(
    students.map((student) => ({ ...student, sessionExamId }))
  );
};

export const getStudentsInModule = async (
  moduleId: string,
  sessionExamId: number
): Promise<StudentType[]> => {
  const result = await db
    .select()
    .from(student)
    .where(
      and(
        eq(student.moduleId, moduleId),
        eq(student.sessionExamId, sessionExamId)
      )
    );
  return result;
};

export const getStudentsPassExam = async (
  selectedExam: ExamWithDetails
): Promise<PageStudent[]> => {
  // Fetch locations
  const locations = await db
    .select({
      id: locationTable.id,
      name: locationTable.name,
      type: locationTable.type,
      size: locationTable.size,
    })
    .from(locationTable)
    .innerJoin(monitoring, eq(monitoring.locationId, locationTable.id))
    .where(
      and(
        eq(locationTable.id, monitoring.locationId),
        eq(monitoring.examId, selectedExam.examId)
      )
    );

  // Fetch exam time slot
  const examTimeSlot = await db.query.timeSlot.findFirst({
    where: eq(timeSlot.id, selectedExam.timeSlotId),
  });

  // Fetch students
  const students = await db
    .selectDistinct({
      cne: student.cne,
      firstName: student.firstName,
      lastName: student.lastName,
      numberOfStudent: studentExamLocation.numberOfStudent,
      locationId: studentExamLocation.locationId,
    })
    .from(studentExamLocation)
    .innerJoin(student, eq(student.cne, studentExamLocation.cne))
    .where(eq(studentExamLocation.examId, selectedExam.examId))
    .orderBy(studentExamLocation.numberOfStudent);

  // Group students by locationId
  const groupedByLocation: { [key: number]: Student[] } = {};
  students.forEach((student) => {
    const locationId = student.locationId;
    if (!groupedByLocation[locationId]) {
      groupedByLocation[locationId] = [];
    }
    groupedByLocation[locationId].push(student);
  });

  // Split each group into subgroups of up to 40 students and return results
  const result: PageStudent[] = Object.keys(groupedByLocation)
    .map((locationId) => {
      const studentsInLocation = groupedByLocation[Number(locationId)];
      const studentGroups: Student[][] = [];
      for (let i = 0; i < studentsInLocation.length; i += 40) {
        studentGroups.push(studentsInLocation.slice(i, i + 40));
      }
      const selectedLocation = locations.find(
        (location) => location.id === Number(locationId)
      );
      if (selectedLocation) {
        return {
          location: selectedLocation,
          studentGroups,
        };
      }
    })
    .filter(Boolean) as PageStudent[];

  return result;
};

interface Student {
  cne: string;
  firstName: string;
  lastName: string;
  numberOfStudent: number;
  locationId: number;
}

interface ExamWithDetails {
  examId: number;
  timeSlotId: number;
}

export interface PageStudent {
  location: LocationType;
  studentGroups: Student[][];
}
