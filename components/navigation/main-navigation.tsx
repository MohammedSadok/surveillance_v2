"use client";
import { useCurrentUser } from "@/hooks/getCurrentUser";
import logo from "@/images/logo.png";
import { cn } from "@/lib/utils";
import {
  BarChartBig,
  BookCheck,
  BookOpen,
  Building2,
  CalendarCheck,
  CalendarDays,
  NotebookText,
  Users,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  sessionId: number;
}
export function MainNav({ sessionId }: SidebarProps) {
  const path = usePathname();
  const user = useCurrentUser();
  return (
    <div className="flex gap-2 md:gap-10 items-center">
      <Link href={`/`} className="hidden items-center space-x-2 md:flex">
        <Image
          src={logo}
          alt={""}
          style={{
            objectFit: "contain",
          }}
          className="w-[120px]"
        />
      </Link>
      <nav className="hidden gap-2 md:flex">
        <Link href={`/sessions/${sessionId}`}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              path === `/sessions/${sessionId}` ? "bg-accent" : "transparent"
            )}
          >
            <BarChartBig className="mr-2 h-4 w-4" />
            <span className="hidden md:block">Dashboard</span>
          </span>
        </Link>
        <Link href={`/sessions/${sessionId}/exams`}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              path === `/sessions/${sessionId}/exams`
                ? "bg-accent"
                : "transparent"
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

        <Link href={`/sessions/${sessionId}/schedule`}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              path === `/sessions/${sessionId}/schedule`
                ? "bg-accent"
                : "transparent"
            )}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            <span className="hidden md:block">Emploi</span>
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

        <Link href={`/sessions/${sessionId}/department`}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              path === `/sessions/${sessionId}/department`
                ? "bg-accent"
                : "transparent"
            )}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Departements</span>
          </span>
        </Link>
        <Link href={`/sessions/${sessionId}/locaux`}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              path === `/sessions/${sessionId}/locaux`
                ? "bg-accent"
                : "transparent"
            )}
          >
            <Building2 className="mr-2 h-4 w-4" />
            <span>Locaux</span>
          </span>
        </Link>
        {user?.isAdmin && (
          <Link href="/users">
            <span
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                path === "/users" ? "bg-accent" : "transparent"
              )}
            >
              <Users className="mr-2 h-4 w-4" />
              <span>Utilisateurs</span>
            </span>
          </Link>
        )}
      </nav>
    </div>
  );
}
