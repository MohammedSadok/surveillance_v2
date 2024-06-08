"use client";
import { useCurrentUser } from "@/hooks/getCurrentUser";
import logo from "@/images/logo.png";
import { cn } from "@/lib/utils";
import { BookOpen, Building2, CalendarDays, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
export function MainNav() {
  const path = usePathname();
  const user = useCurrentUser();
  return (
    <div className="flex gap-2 md:gap-10 items-center">
      <Link href="/" className="hidden items-center space-x-2 md:flex">
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
        <Link href="/sessions">
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              path === "/sessions" ? "bg-accent" : "transparent"
            )}
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            <span>Sessions</span>
          </span>
        </Link>
        <Link href="/department">
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              path === "/department" ? "bg-accent" : "transparent"
            )}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            <span>Departements</span>
          </span>
        </Link>
        <Link href="/locaux">
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              path === "/locaux" ? "bg-accent" : "transparent"
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
