import { Zap } from "lucide-react";
import { cn } from "@/lib/cn";

export function NexusMark({ className, iconClassName }: { className?: string; iconClassName?: string }) {
  return (
    <span
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-xl bg-[#201a3e] text-primary shadow-[0_0_18px_rgba(130,92,237,0.28)]",
        className,
      )}
    >
      <Zap className={cn("size-4", iconClassName)} aria-hidden strokeWidth={2.4} />
    </span>
  );
}

export function NexusWordmark({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-2.5", className)}>
      <NexusMark />
      <span className="leading-tight">
        <span className="block text-[15px] font-semibold tracking-[0.14em] text-[#c4b5fd]">NEXUS</span>
        {compact ? null : (
          <span className="block text-[11px] text-muted">Crypto Intelligence</span>
        )}
      </span>
    </span>
  );
}
