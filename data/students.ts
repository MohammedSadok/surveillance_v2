"use server";
import { db } from "@/lib/config";
import {
  moduleTable,
  ModuleType,
  Option,
  option,
  Student,
  student,
} from "@/lib/schema";
import { groupData, GroupedData, RawData } from "@/lib/utils";
import { and, eq } from "drizzle-orm";

function transformData(
  rawData: RawData[],
  sessionExamId: number
): Omit<Student, "id">[] {
  return rawData.map((data) => ({
    cin: data[3],
    firstName: data[1],
    lastName: data[2],
    sessionExamId: sessionExamId,
    moduleId: data[6],
  }));
}

export const insertStudent = async (students: Omit<Student, "id">[]) => {
  await db.insert(student).values(students);
};

export const insertOption = async (newOption: Option) => {
  await db.insert(option).values(newOption);
};

export const insertModule = async (newModule: ModuleType) => {
  await db.insert(moduleTable).values(newModule);
};

export const getModule = async (newModule: ModuleType) => {
  const result = await db.query.moduleTable.findFirst({
    where: and(
      eq(moduleTable.id, newModule.id),
      eq(moduleTable.optionId, newModule.optionId)
    ),
  });
  return result || null;
};

export const getOption = async (newOption: Option) => {
  const result = await db.query.option.findFirst({
    where: and(eq(option.id, newOption.id), eq(option.name, newOption.name)),
  });
  return result || null;
};
export const processGroupedData = async (
  data: RawData[],
  sessionExamId: number
) => {
  const groupedData = groupData(data);
  console.log("=>  groupedData:", groupedData);
  // const students = transformData(data, sessionExamId);

  // const optionPromises = Object.entries(groupedData).map(
  //   async ([optionId, optionData]) => {
  //     // Check if option exists
  //     const existingOption = await db.query.option.findFirst({
  //       where: eq(option.id, optionId),
  //     });
  //     if (!existingOption) {
  //       // Insert option if not exists
  //       await insertOption({ id: optionId, name: optionData.name });
  //     }

  //     await db.transaction(async (trx) => {
  //       const modulePromises = Object.entries(optionData.modules).map(
  //         async ([moduleId, moduleData]) => {
  //           // Check if module exists within the transaction
  //           const existingModule = await trx.query.moduleTable.findFirst({
  //             where: and(
  //               eq(moduleTable.id, moduleId),
  //               eq(moduleTable.name, moduleData.name)
  //             ),
  //           });
  //           if (!existingModule) {
  //             // Insert module if not exists within the transaction
  //             await trx.insert(moduleTable).values({
  //               id: moduleId,
  //               name: moduleData.name,
  //               optionId: optionId,
  //             });
  //           }
  //         }
  //       );

  //       await Promise.all(modulePromises);
  //     });
  //   }
  // );

  // // Wait for all option insertions to complete
  // await Promise.all(optionPromises);

  // Insert all students after all options and modules have been inserted
  // await insertStudent(students);
};

export const insertOptionAndModules = async (data: GroupedData) => {
  for (const optionId in data) {
    if (data.hasOwnProperty(optionId)) {
      const existOption = await getOption({
        id: optionId,
        name: data[optionId].name,
      });

      if (!existOption) {
        await insertOption({ id: optionId, name: data[optionId].name });
      }

      for (const moduleId in data[optionId].modules) {
        if (data[optionId].modules.hasOwnProperty(moduleId)) {
          const existModule = await getModule({
            id: moduleId,
            name: data[optionId].modules[moduleId].name,
            optionId: optionId,
          });
          if (!existModule) {
            await insertModule({
              id: moduleId,
              name: data[optionId].modules[moduleId].name,
              optionId: optionId,
            });
          }
        }
      }
    }
  }
};
