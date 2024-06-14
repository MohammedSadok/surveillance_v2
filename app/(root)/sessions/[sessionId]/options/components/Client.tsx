"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useModal } from "@/hooks/useModalStore";
import { Option } from "@/lib/schema";
import { Plus } from "lucide-react";
import { columns } from "./Columns";

interface OptionsClientProps {
  data: Option[];
  sessionId: string;
}

export const OptionsClient: React.FC<OptionsClientProps> = ({
  data,
  sessionId,
}) => {
  const { onOpen } = useModal();
  const tableColumns = columns({
    sessionId: parseInt(sessionId),
    options: data,
  });
  return (
    <>
      <Separator className="mt-2" />
      <div className="flex items-center justify-between">
        <Heading
          title={`Options (${data.length})`}
          description="Gérer les Options"
        />
        <Button onClick={() => onOpen("createSession")}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter une nouvelle option
        </Button>
      </div>
      <DataTable searchKey="name" columns={tableColumns} data={data} />
    </>
  );
};
