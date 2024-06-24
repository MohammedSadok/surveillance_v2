"use client";
import { LocationType } from "@/lib/schema";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { CellAction } from "./CellAction";
interface ColumnsProps {
  sessionId: number;
  locations: LocationType[];
}
export const columns = ({
  sessionId,
  locations,
}: ColumnsProps): ColumnDef<LocationType>[] => [
  {
    accessorKey: "name",
    header: "Nom",
    cell: ({ row }) => (
      <Link
        href={`/sessions/${sessionId}/locaux/${row.original.id}`}
        className="underline"
      >
        {row.original.type == "AMPHITHEATER"
          ? row.original.name
          : "Salle " + row.original.name}
      </Link>
    ),
  },
  {
    accessorKey: "size",
    header: "Taille",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) =>
      row.original.type == "AMPHITHEATER" ? "amphi" : "salle",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
