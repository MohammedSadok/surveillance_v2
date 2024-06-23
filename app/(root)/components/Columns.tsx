"use client";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import Link from "next/link";
import { CellAction } from "./CellAction";
import { SessionExam } from "@/lib/schema";
// format(item.startDate, "MMMM do, yyyy")
export const columns: ColumnDef<SessionExam>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Link href={`/sessions/${row.original.id}`} className="underline">
        {row.original.type}
      </Link>
    ),
  },

  {
    accessorKey: "startDate",
    header: "Date de Debut",
    cell: ({ row }) => format(row.original.startDate, "MMMM do, yyyy"),
  },
  {
    accessorKey: "endDate",
    header: "Date de Fin",
    cell: ({ row }) => format(row.original.endDate, "MMMM do, yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
