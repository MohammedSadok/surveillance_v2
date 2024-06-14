"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useModal } from "@/hooks/useModalStore";
import { Option } from "@/lib/schema";
import { Plus } from "lucide-react";
import { columns } from "./Columns";

interface ModulesClientProps {
  data: Option[];
  sessionId: string;
  optionId: string;
}

export const ModulesClient: React.FC<ModulesClientProps> = ({
  data,
  sessionId,
  optionId,
}) => {
  const { onOpen } = useModal();
  const tableColumns = columns({
    sessionId: parseInt(sessionId),
    modules: data,
    optionId: optionId,
  });
  return (
    <>
      <Separator className="mt-2" />
      <div className="flex items-center justify-between">
        <Heading
          title={`Modules (${data.length})`}
          description="Gérer les modules"
        />
        <Button onClick={() => onOpen("createSession")}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter un noveau module
        </Button>
      </div>
      <DataTable searchKey="name" columns={tableColumns} data={data} />
    </>
  );
};
