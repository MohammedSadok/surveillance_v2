"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useRouter } from "next/navigation";
import React, { useRef } from "react";

import { DayWithTimeSlots } from "@/lib/utils";

interface ScheduleProps {
  sessionDays: DayWithTimeSlots[];
  sessionId: string;
}

const Schedule: React.FC<ScheduleProps> = ({ sessionDays, sessionId }) => {
  const router = useRouter();
  const componentRef = useRef<any>();
  // const handlePrint = useReactToPrint({
  //   content: () => componentRef.current,
  // });
  return (
    <div className="flex flex-col gap-3 relative">
      <div className="flex flex-row-reverse">
        {/* <Button onClick={handlePrint} variant="ghost">
          <FileDown />
        </Button> */}
      </div>
      <Table className="border rounded-lg">
        <TableHeader>
          <TableRow>
            <TableCell className="border text-center" rowSpan={2}>
              Jours
            </TableCell>
          </TableRow>
          <TableRow>
            {sessionDays[0].timeSlots.map((item) => (
              <TableCell key={item.timePeriod} className="border text-center">
                {item.timePeriod}
              </TableCell>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessionDays.map((item) => (
            <TableRow key={item.date} className="py-4">
              <TableCell className="border text-center">{item.date}</TableCell>
              {item.timeSlots.map((timeSlotItem) => (
                <TableCell
                  key={timeSlotItem.id}
                  className="border text-center cursor-pointer hover:bg-gray-300"
                  onClick={() =>
                    router.push(`/sessions/${sessionId}/${timeSlotItem.id}`, {
                      scroll: false,
                    })
                  }
                >
                  {/* {timeSlotItem.Exam.map((exam) =>
                    exam.moduleName !== "Rs" && exam.moduleName ? (
                      <div key={exam.id}>
                        <p>{exam.moduleName + " / " + exam.options}</p>
                      </div>
                    ) : null
                  )} */}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {/* <div className="hidden">
        <div ref={componentRef}>
          <PrintSchedule sessionDays={sessionDays} />
        </div>
      </div> */}
    </div>
  );
};

export default Schedule;
