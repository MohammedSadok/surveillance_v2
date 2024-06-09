"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useModal } from "@/hooks/useModalStore";
import { Plus } from "lucide-react";
import { columns } from "./Columns";
import { Department } from "@/lib/schema";

interface DepartmentClientProps {
  data: Department[];
}

export const DepartmentClient: React.FC<DepartmentClientProps> = ({ data }) => {
  const { onOpen } = useModal();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Départements (${data.length})`}
          description="Gérer les départements"
        />
        <Button onClick={() => onOpen("createDepartment")}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un nouveau département
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
    </>
  );
};
