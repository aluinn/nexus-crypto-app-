import { cn } from "@/lib/cn";

export function NexusWordmark({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("leading-tight", className)}>
      <span className="block text-[15px] font-semibold tracking-[0.14em] text-[#c4b5fd]">NEXUS</span>
      {compact ? null : (
        <span className="block text-[11px] text-muted">Crypto Intelligence</span>
      )}
    </span>
  );
}
