"use client";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useModal } from "@/hooks/useModalStore";
import { Plus } from "lucide-react";
import { columns } from "./Columns";
import { SessionExam } from "@/lib/schema";

interface SessionClientProps {
  data: SessionExam[];
}

export const SessionClient: React.FC<SessionClientProps> = ({ data }) => {
  const { onOpen } = useModal();
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Sessions (${data.length})`}
          description="Gérer les sessions"
        />
        <Button onClick={() => onOpen("createSession")}>
          <Plus className="mr-2 h-4 w-4" /> Ajouter une nouvelle session
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="type" columns={columns} data={data} />
    </>
  );
};
