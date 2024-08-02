import { ModuleType } from "@/lib/schema";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { CellAction } from "./CellAction";

interface ColumnsProps {
  sessionId: number;
  optionId: string;
}

export const columns = ({
  sessionId,
  optionId,
}: ColumnsProps): ColumnDef<ModuleType>[] => [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Link
        href={`/sessions/${sessionId}/options/${optionId}/${row.original.id}`}
        className="underline"
      >
        {row.original.id}
      </Link>
    ),
  },
  {
    accessorKey: "name",
    header: "Nom du module",
    cell: ({ row }) => row.original.name,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
