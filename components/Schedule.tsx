"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

import { getMonitoringInDate } from "@/data/monitoring";
import { getDaysWithTimeSlots } from "@/data/timeSlot";
import { MonitoringLine } from "@/lib/schema";
import { DayWithTimeSlots } from "@/lib/utils";

interface ScheduleProps {
  sessionDays: DayWithTimeSlots[];
  sessionId: string;
}

const Schedule: React.FC<ScheduleProps> = ({ sessionDays, sessionId }) => {
  useEffect(() => {
    const fetchData = async () => {
      try {
        let monitoringLines: Omit<MonitoringLine, "id">[] = [];
        const daysWithTimeSlots = await getDaysWithTimeSlots(
          parseInt(sessionId)
        );
        const { monitoringInAfternoon } = await getMonitoringInDate(
          daysWithTimeSlots[0]
        );
        console.log(monitoringInAfternoon);
      } catch (error) {}
    };

    fetchData();
  }, [sessionId]);

  const router = useRouter();
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
                onClick={() =>
                  router.push(`/sessions/${sessionId}/${timeSlot.id}`, {
                    scroll: false,
                  })
                }
              >
                {timeSlot.exams.length > 0
                  ? timeSlot.exams.map((exam) => (
                      <div key={exam.id}>
                        <p>{exam.moduleName}</p>
                      </div>
                    ))
                  : null}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default Schedule;
