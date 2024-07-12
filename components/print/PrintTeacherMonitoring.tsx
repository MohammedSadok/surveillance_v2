import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DayWithTimeSlotsAndMonitoring } from "@/data/monitoring";

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
              <TableRow key={1}>
                <TableCell
                  className="border text-center text-xs p-0.2"
                  rowSpan={2}
                >
                  Enseignants
                </TableCell>

                {displayedDays.map((day, index) => (
                  <TableCell
                    key={day.date}
                    className="border text-center p-0.2 text-xs relative"
                    colSpan={4}
                  >
                    {day.date}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow key={2}>
                {displayedDays.map((day, index) => (
                  <>
                    <TableCell
                      className="border text-center text-xs p-0"
                      colSpan={2}
                      key={index}
                    >
                      Matin
                    </TableCell>
                    <TableCell
                      className="border text-center text-xs p-0"
                      colSpan={2}
                      key={index}
                    >
                      Aprés-midi
                    </TableCell>
                  </>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {teachers.map((teacher, index) => (
                <TableRow key={index} className="py-4">
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
                          key={timeSlotItem.id}
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
