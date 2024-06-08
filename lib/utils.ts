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
  period: string;
  timePeriod: string;
};

export type DayWithTimeSlots = {
  date: string;
  timeSlots: TimeSlot[];
};
