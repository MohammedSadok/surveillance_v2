import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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
