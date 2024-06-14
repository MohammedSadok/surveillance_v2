import { Option } from "@/lib/schema";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { CellAction } from "./CellAction";

interface ColumnsProps {
  sessionId: number;
  options: Option[];
}

export const columns = ({
  sessionId,
  options,
}: ColumnsProps): ColumnDef<Option>[] => [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Link
        href={`/sessions/${sessionId}/options/${row.original.id}`}
        className="underline"
      >
        {row.original.id}
      </Link>
    ),
  },
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => row.original.name,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
