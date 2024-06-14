import { StudentType } from "@/lib/schema";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./CellAction";

interface ColumnsProps {
  sessionId: number;
  optionId: string;
  moduleId: string;
  students: StudentType[];
}

export const columns = ({
  sessionId,
  optionId,
  moduleId,
  students,
}: ColumnsProps): ColumnDef<StudentType>[] => [
  {
    accessorKey: "cne",
    header: "CNE",
    cell: ({ row }) => row.original.cne,
  },
  {
    accessorKey: "lastName",
    header: "Nom",
    cell: ({ row }) => row.original.lastName,
  },
  {
    accessorKey: "firstName",
    header: "Prénom",
    cell: ({ row }) => row.original.firstName,
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
