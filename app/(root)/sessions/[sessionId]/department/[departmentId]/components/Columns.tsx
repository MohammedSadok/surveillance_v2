"use client";

import { Teacher } from "@/lib/schema";
import { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import Link from "next/link";
import { CellAction } from "./CellAction";
interface ColumnsProps {
  sessionId: number;
  teachers: Teacher[];
}
export const columns = ({
  sessionId,
  teachers,
}: ColumnsProps): ColumnDef<Teacher>[] => [
  {
    accessorKey: "lastName",
    header: "Nom",
    cell: ({ row }) => (
      <Link
        href={`/sessions/${sessionId}/department/${row.original.id}/${row.original.id}`}
        className="underline"
      >
        {row.original.lastName}
      </Link>
    ),
  },
  {
    accessorKey: "firstName",
    header: "Prénom",
  },
  {
    accessorKey: "phoneNumber",
    header: "Numéro de téléphone",
  },
  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "isDispense",
    header: "Est Dispencer",
    cell: ({ row }) =>
      row.original.isDispense === false ? (
        <X className="w-5 h-5" />
      ) : (
        <Check className="w-5 h-5 " />
      ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
