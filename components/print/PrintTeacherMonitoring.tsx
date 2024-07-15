import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DayWithTimeSlotsAndMonitoring } from "@/data/monitoring";
import React from "react";

interface Props {
  sessionDays: DayWithTimeSlotsAndMonitoring[];
  selectedDepartment: number | null;
}

const PrintTeacherMonitoring = ({ sessionDays, selectedDepartment }: Props) => {
  // Function to chunk the session days into groups of 6 days

  const allTeachers = sessionDays.flatMap((day) =>
    day.timeSlots.flatMap((slot) => slot.monitoring)
  );

  const filteredTeachers = selectedDepartment
    ? allTeachers.filter(
        (teacher) => teacher.departmentId === selectedDepartment
      )
    : allTeachers;

  const teachers = Array.from(
    new Set(
      filteredTeachers.map(
        (teacher) => teacher.teacherFirstName + " " + teacher.teacherLastName
      )
    )
  );

  const chunkArray = (
    array: DayWithTimeSlotsAndMonitoring[],
    chunkSize: number
  ) => {
    const chunkedArray = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunkedArray.push(array.slice(i, i + chunkSize));
    }
    return chunkedArray;
  };

  const groupedDays = chunkArray(sessionDays, 7);

  return (
    <>
      {groupedDays.map((displayedDays, pageIndex) => (
        <div key={pageIndex} className="mb-3">
          <Table className="border rounded-lg">
            <TableHeader>
              <TableRow key={`header-row-${pageIndex}-1`}>
                <TableCell
                  className="border text-center text-xs p-0.2"
                  rowSpan={2}
                >
                  Enseignants
                </TableCell>

                {displayedDays.map((day) => (
                  <TableCell
                    key={day.date}
                    className="border text-center p-0.2 text-xs relative"
                    colSpan={4}
                  >
                    {day.date}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow key={`header-row-${pageIndex}-2`}>
                {displayedDays.map((day, dayIndex) => (
                  <React.Fragment key={`header-row-${pageIndex}-${day.date}`}>
                    <TableCell
                      className="border text-center text-xs p-0"
                      colSpan={2}
                    >
                      Matin
                    </TableCell>
                    <TableCell
                      className="border text-center text-xs p-0"
                      colSpan={2}
                    >
                      Aprés-midi
                    </TableCell>
                  </React.Fragment>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher, teacherIndex) => (
                <TableRow
                  key={`teacher-row-${pageIndex}-${teacherIndex}`}
                  className="py-4"
                >
                  <TableCell className="border text-center text-xs p-0.2">
                    {teacher}
                  </TableCell>
                  {displayedDays
                    .flatMap((day) => day.timeSlots)
                    .map((timeSlotItem) => {
                      const monitoringLine = allTeachers.find(
                        (monitoring) =>
                          monitoring.teacherFirstName +
                            " " +
                            monitoring.teacherLastName ===
                            teacher && monitoring.timeSlotId === timeSlotItem.id
                      );
                      return (
                        <TableCell
                          key={`timeSlotItem-${pageIndex}-${timeSlotItem.id}`}
                          className="border text-center text-xs p-0.2 w-8"
                        >
                          {monitoringLine ? (
                            <span>{monitoringLine.cause}</span>
                          ) : null}
                        </TableCell>
                      );
                    })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}
    </>
  );
};

export default PrintTeacherMonitoring;
