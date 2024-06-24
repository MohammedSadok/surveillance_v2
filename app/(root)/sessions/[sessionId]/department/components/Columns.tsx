"use client";
import { Department } from "@/lib/schema";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { CellAction } from "./CellAction";
interface ColumnsProps {
  sessionId: number;
  departments: Department[];
}
export const columns = ({
  sessionId,
  departments,
}: ColumnsProps): ColumnDef<Department>[] => [
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => (
      <Link
        href={`/sessions/${sessionId}/department/${row.original.id}`}
        className="underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
