"use client";

import { ExamWithDetails } from "@/data/exam";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./CellAction";

export const columns: ColumnDef<ExamWithDetails>[] = [
  {
    accessorKey: "moduleId",
    header: "Id",
  },
  {
    accessorKey: "moduleName",
    header: "Nom du module",
  },
  {
    accessorKey: "studentCount",
    header: "Nombre d'étudiants inscrits",
  },
  {
    accessorKey: "responsibleName",
    header: "Responsable du module",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
