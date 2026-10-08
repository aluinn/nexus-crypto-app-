"use client";

import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { TransitionLink } from "@/components/transition/transition-link";
import { NexusMark } from "@/components/ui/logo";
import { cn } from "@/lib/cn";

const LINKS = [
  { href: "#product", label: "Product" },
  { href: "#features", label: "Features" },
  { href: "#workflow", label: "Workflow" },
  { href: "#about", label: "About" },
];

export function LandingNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        scrolled || open ? "border-b border-white/10 bg-[#080a12]/92" : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#product" className="flex items-center gap-2.5 rounded-lg">
          <NexusMark className="size-8 rounded-lg" />
          <span className="text-sm font-semibold tracking-[0.16em] text-[#c4b5fd]">NEXUS</span>
        </a>
        <nav aria-label="Page" className="hidden items-center gap-7 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="text-sm text-muted hover:text-foreground">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <TransitionLink
            href="/app/for-you"
            className="inline-flex min-h-11 items-center rounded-full bg-primary px-4 text-sm font-medium text-white hover:bg-primary-bright"
          >
            Open Nexus
          </TransitionLink>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-xl border border-white/10 md:hidden"
            aria-expanded={open}
            aria-controls="landing-menu"
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
          </button>
        </div>
      </div>
      {open ? (
        <nav id="landing-menu" aria-label="Mobile" className="border-t border-white/10 px-4 py-3 md:hidden">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="flex min-h-11 items-center text-sm text-foreground"
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      ) : null}
    </header>
  );
}
