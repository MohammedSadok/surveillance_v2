import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Student } from "./schema";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function transformTime(inputTime: string): string {
  // Extract hours and minutes from the input string
  const startHour = inputTime.slice(0, 2);
  const startMinute = inputTime.slice(2, 4);
  const endHour = inputTime.slice(4, 6);
  const endMinute = inputTime.slice(6, 8);

  // Concatenate the formatted times with a hyphen
  const transformedTime = `${startHour}:${startMinute} - ${endHour}:${endMinute}`;

  return transformedTime;
}
type TimeSlot = {
  id: number;
  period: string;
  timePeriod: string;
};

export type DayWithTimeSlots = {
  date: string;
  timeSlots: TimeSlot[];
};
export const expectedColumns = [
  "CODE_ETUDIANT",
  "NOM",
  "PRENOM",
  "CIN",
  "CNE",
  "DATE_NAISSANCE",
  "COD_ELP",
  "LIB_ELP",
  "VERSION_ETAPE",
  "CODE_ETAPE",
];

export type RawData = [
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string,
  string
];

export interface GroupedData {
  [optionId: string]: {
    name: string;
    modules: {
      [moduleId: string]: {
        name: string;
      };
    };
  };
}

export const groupData = (data: RawData[]): GroupedData => {
  return data.reduce((acc, row) => {
    const [
      codeEtudiant,
      lastName,
      firstName,
      cin,
      cne,
      birthDate,
      codElp,
      libElp,
      versionEtape,
      codeEtape,
    ] = row;

    if (!acc[codeEtape]) {
      acc[codeEtape] = {
        name: versionEtape,
        modules: {},
      };
    }

    if (!acc[codeEtape].modules[codElp]) {
      acc[codeEtape].modules[codElp] = {
        name: libElp,
      };
    }
    return acc;
  }, {} as GroupedData);
};

export const transformData = (
  rawData: RawData[],
  sessionExamId: number
): Omit<Student, "id">[][] => {
  const data = rawData.map((data) => ({
    cne: data[4],
    firstName: data[1],
    lastName: data[2],
    sessionExamId: sessionExamId,
    moduleId: data[6],
  }));
  const size = 10000;
  const result = [];
  for (let i = 0; i < data.length; i += size) {
    result.push(data.slice(i, i + size));
  }
  return result;
};

export const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");
  return new Date(`${year}-${month}-${day}`);
};
