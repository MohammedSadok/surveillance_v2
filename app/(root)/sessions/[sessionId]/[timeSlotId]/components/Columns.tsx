"use client";
import { ExamType } from "@/lib/types";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./CellAction";

export const columns: ColumnDef<ExamType>[] = [
  {
    accessorKey: "moduleName",
    header: "Nom du module",
  },
  {
    accessorKey: "options",
    header: "Filière",
  },
  {
    accessorKey: "enrolledStudentsCount",
    header: "Nombre d'étudiants inscrits",
  },
  {
    accessorKey: "responsable_module",
    header: "Responsable de module",
    cell: ({ row }) => (
      <p>
        Pr.
        {row.original.moduleResponsible?.lastName +
          " " +
          row.original.moduleResponsible?.firstName}
      </p>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
