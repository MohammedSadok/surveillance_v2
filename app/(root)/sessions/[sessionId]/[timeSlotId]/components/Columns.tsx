"use client";

import { Exam } from "@/lib/schema";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./CellAction";

export const columns: ColumnDef<Exam>[] = [
  {
    accessorKey: "moduleId",
    header: "Nom du module",
  },
  {
    accessorKey: "options",
    header: "Module",
  },
  {
    accessorKey: "enrolledStudentsCount",
    header: "Nombre d'étudiants inscrits",
  },
  // {
  //   accessorKey: "responsable_module",
  //   header: "Responsable de module",
  //   cell: ({ row }) => (
  //     <p>
  //       Pr.
  //       {row.original.moduleResponsible?.lastName +
  //         " " +
  //         row.original.moduleResponsible?.firstName}
  //     </p>
  //   ),
  // },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
