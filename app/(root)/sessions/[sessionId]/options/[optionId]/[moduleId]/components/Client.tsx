"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useModal } from "@/hooks/useModalStore";
import { ModuleType, Option, StudentType } from "@/lib/schema";
import { Plus } from "lucide-react";
import { columns } from "./Columns";

interface StudentClientProps {
  data: StudentType[];
  option: Option;
  module: ModuleType;
  sessionId: string;
}

export const StudentClient: React.FC<StudentClientProps> = ({
  data,
  sessionId,
  module,
  option,
}) => {
  const { onOpen } = useModal();
  const tableColumns = columns({
    sessionId: parseInt(sessionId),
    students: data,
    optionId: option.id,
    moduleId: module.id,
  });
  return (
    <>
      <Separator className="mt-2" />
      <div className="flex items-center justify-between">
        <Heading
          title={`Étudiants (${data.length})`}
          description={`Gérer les étudiants de l'option ${option.name} du module ${module.name}`}
        />
        <div className="space-x-2">
          <Button onClick={() => onOpen("loadStudents")}>
            <Plus className="mr-2 h-4 w-4" /> charger des étudiants
          </Button>
          <Button onClick={() => onOpen("createStudent")}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un nouvel étudiant
          </Button>
        </div>
      </div>
      <DataTable searchKey="cne" columns={tableColumns} data={data} />
    </>
  );
};
