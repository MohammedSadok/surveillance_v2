"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useModal } from "@/hooks/useModalStore";
import { ExamType, timeSlotType } from "@/lib/types";
import { SessionExam } from "@prisma/client";
import { format } from "date-fns";
import { Plus } from "lucide-react";
import { columns } from "./Columns";

interface ExamClientProps {
  session: SessionExam | null;
  data: ExamType[];
  timeSlot: timeSlotType | null;
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
            description={`le ${format(timeSlot.day.date, "EEEE d-MM-y")} de ${
              timeSlot?.period
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
      <DataTable searchKey="moduleName" columns={columns} data={data} />
    </>
  );
};
