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
import { useRouter } from "next/navigation";
interface ScheduleProps {
  sessionDays: OccupationCalendar[];
  locationId: number;
}
const LocationSchedule: React.FC<ScheduleProps> = ({
  sessionDays,
  locationId,
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
                    onOpen("createOccupiedLocation", {
                      occupiedLocation: {
                        cause: "",
                        locationId: locationId,
                        timeSlotId: timeSlot.id,
                      },
                    });
                  } else if (timeSlot.cause !== "Exam") {
                    onOpen("updateOccupiedLocation", {
                      occupiedLocation: {
                        cause: timeSlot.cause,
                        locationId: locationId,
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

export default LocationSchedule;
