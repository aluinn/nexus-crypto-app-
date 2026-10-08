"use client";

import { Bell, Bookmark, BookOpen, CalendarDays, Newspaper, PieChart } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { EASE } from "@/lib/motion";

export const NAV_ITEMS = [
  { href: "/app/for-you", label: "For You", icon: Newspaper },
  { href: "/app/portfolio", label: "Portfolio", icon: PieChart },
  { href: "/app/journal", label: "Journal", icon: BookOpen },
  { href: "/app/saved", label: "Saved", icon: Bookmark },
  { href: "/app/notifications", label: "Notifications", icon: Bell },
  { href: "/app/events", label: "Events", icon: CalendarDays },
] as const;

export function NavLinks({
  onNavigate,
  scope = "desktop",
}: {
  onNavigate?: () => void;
  scope?: "desktop" | "mobile";
}) {
  const pathname = usePathname();
  return (
    <nav aria-label="Application" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex min-h-11 items-center gap-3 rounded-xl border px-3 text-sm transition-colors",
              active
                ? "border-[#3c2f72] text-foreground"
                : "border-transparent text-[#9aa6bd] hover:bg-white/[0.04] hover:text-foreground",
            )}
          >
            {active ? (
              <motion.span
                layoutId={`nav-active-bg-${scope}`}
                aria-hidden
                className="absolute inset-0 -z-10 rounded-xl bg-[#1a1732] shadow-[0_0_24px_rgba(130,92,237,0.16)]"
                transition={{ duration: 0.3, ease: EASE }}
              />
            ) : null}
            <Icon className="size-4 shrink-0" aria-hidden />
            <span className="flex-1">{item.label}</span>
            {active ? <span className="size-1.5 rounded-full bg-primary" aria-hidden /> : null}
          </Link>
        );
      })}
    </nav>
  );
}
