"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OccupationCalendar } from "@/data/teacher";
import { useModal } from "@/hooks/useModalStore";
interface ScheduleProps {
  sessionDays: OccupationCalendar[];
  teacherId: number;
}
const TeacherSchedule: React.FC<ScheduleProps> = ({
  sessionDays,
  teacherId,
}) => {
  const { onOpen } = useModal();
  return (
    <Table className="border rounded-lg mt-2">
      <TableHeader>
        <TableRow>
          <TableCell className="border text-center" rowSpan={2}>
            Jours
          </TableCell>
        </TableRow>
        <TableRow>
          {sessionDays[0]?.timeSlots.map((item) => (
            <TableCell key={item.timePeriod} className="border text-center">
              {item.timePeriod}
            </TableCell>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {sessionDays.map((day) => (
          <TableRow key={day.date} className="py-4">
            <TableCell className="border text-center">{day.date}</TableCell>
            {day.timeSlots.map((timeSlot) => (
              <TableCell
                key={timeSlot.id}
                className="border text-center cursor-pointer hover:bg-gray-300"
                onClick={() => {
                  if (!timeSlot.cause) {
                    onOpen("createOccupiedTeacher", {
                      occupiedTeacher: {
                        cause: "",
                        teacherId,
                        timeSlotId: timeSlot.id,
                      },
                    });
                  } else if (
                    timeSlot.cause !== "TT" &&
                    timeSlot.cause != "RR"
                  ) {
                    onOpen("updateOccupiedTeacher", {
                      occupiedTeacher: {
                        cause: timeSlot.cause,
                        teacherId,
                        timeSlotId: timeSlot.id,
                      },
                    });
                  }
                }}
              >
                {timeSlot.cause}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TeacherSchedule;
