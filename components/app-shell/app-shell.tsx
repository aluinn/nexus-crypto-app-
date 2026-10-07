"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { NavLinks } from "@/components/app-shell/nav-links";
import { NexusWordmark } from "@/components/ui/logo";

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = previous;
    };
  }, [open]);

  return (
    <div className="min-h-dvh bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-white/10 bg-background px-4 py-5 lg:flex">
        <Link href="/" className="mb-8 rounded-xl px-1">
          <NexusWordmark />
        </Link>
        <NavLinks />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-background/95 px-4 py-3 lg:hidden">
        <Link href="/" aria-label="Nexus home">
          <NexusWordmark compact />
        </Link>
        <button
          type="button"
          className="grid size-11 place-items-center rounded-xl border border-white/10"
          aria-expanded={open}
          aria-controls="mobile-app-nav"
          onClick={() => setOpen(true)}
        >
          <Menu className="size-5" />
          <span className="sr-only">Open navigation</span>
        </button>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button type="button" className="absolute inset-0 bg-black/70" aria-label="Close navigation" onClick={() => setOpen(false)} />
          <div
            id="mobile-app-nav"
            className="absolute inset-y-0 left-0 flex w-[min(100%,320px)] flex-col bg-background px-4 py-5 shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <NexusWordmark />
              <button
                type="button"
                className="grid size-11 place-items-center rounded-xl border border-white/10"
                onClick={() => setOpen(false)}
              >
                <X className="size-5" />
                <span className="sr-only">Close navigation</span>
              </button>
            </div>
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
        </div>
      ) : null}

      <div className="lg:pl-[240px]">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
          <p className="mt-10 text-xs leading-5 text-muted">
            Nexus organises market information and personal notes. It is not financial advice and it does not place trades.
          </p>
        </div>
      </div>
    </div>
  );
}
