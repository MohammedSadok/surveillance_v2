"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ExamWithDetails } from "@/data/exam";
import { useModal } from "@/hooks/useModalStore";
import { SessionExam, TimeSlot } from "@/lib/schema";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { columns } from "./Columns";

interface ExamClientProps {
  session: SessionExam;
  data: ExamWithDetails[];
  timeSlot: TimeSlot;
}

export const ExamClient: React.FC<ExamClientProps> = ({
  data,
  timeSlot,
  session,
}) => {
  const { onOpen } = useModal();
  return (
    <>
      <div className="flex items-center justify-between">
        {timeSlot && (
          <Heading
            title={`Examens (${data.length})`}
            description={`${format(timeSlot.date, "EEEE d-MM-y")} ${
              timeSlot?.timePeriod
            } `}
          />
        )}
        {!session?.isValidated && (
          <Button onClick={() => onOpen("createExam")}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un nouvel examen
          </Button>
        )}
      </div>
      <Separator />
      <DataTable searchKey="moduleId" columns={columns} data={data} />
    </>
  );
};
