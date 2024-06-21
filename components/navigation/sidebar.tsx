"use client";
import { cn } from "@/lib/utils";

import {
  BookCheck,
  CalendarCheck,
  NotebookText,
  SquareUserRound,
  Table,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  sessionId: number;
}

export function Sidebar({ sessionId }: SidebarProps) {
  const path = usePathname();

  return (
    <div className="flex gap-2 ml-3">
      <Link href={`/sessions/${sessionId}`}>
        <span
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            path === `/sessions/${sessionId}` ? "bg-accent" : "transparent"
          )}
        >
          <BookCheck className="mr-2 h-4 w-4" />
          <span className="hidden md:block">Exams</span>
        </span>
      </Link>
      <Link href={`/sessions/${sessionId}/surveillance`}>
        <span
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            path === `/sessions/${sessionId}/surveillance`
              ? "bg-accent"
              : "transparent"
          )}
        >
          <CalendarCheck className="mr-2 h-4 w-4" />
          <span className="hidden md:block">Surveillance</span>
        </span>
      </Link>
      <Link href={`/sessions/${sessionId}/options`}>
        <span
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            path === `/sessions/${sessionId}/options`
              ? "bg-accent"
              : "transparent"
          )}
        >
          <NotebookText className="mr-2 h-4 w-4" />
          <span className="hidden md:block">Options</span>
        </span>
      </Link>
      <Link href={`/sessions/${sessionId}/schedule`}>
        <span
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            path === `/sessions/${sessionId}/schedule`
              ? "bg-accent"
              : "transparent"
          )}
        >
          <Table className="mr-2 h-4 w-4" />
          <span className="hidden md:block">Emploi</span>
        </span>
      </Link>
      <Link href={`/sessions/${sessionId}/occupied-teacher`}>
        <span
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            path === `/sessions/${sessionId}/occupied-teacher`
              ? "bg-accent"
              : "transparent"
          )}
        >
          <SquareUserRound className="mr-2 h-4 w-4" />
          <span className="hidden md:block">Enseignant occupé</span>
        </span>
      </Link>
    </div>
  );
}
