"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Teacher } from "@/lib/schema";
import { Check, X } from "lucide-react";
import { CellAction } from "./CellAction";
export const columns: ColumnDef<Teacher>[] = [
  {
    accessorKey: "lastName",
    header: "Nom",
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
