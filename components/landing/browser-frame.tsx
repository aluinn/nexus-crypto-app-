import { cn } from "@/lib/cn";

export function BrowserFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-2xl border border-white/10 bg-[#0c1018] shadow-[0_24px_80px_rgba(0,0,0,0.35)]", className)}>
      <div className="flex h-10 items-center gap-1.5 border-b border-white/10 px-4">
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
        <span className="size-2.5 rounded-full bg-white/15" />
      </div>
      {children}
    </div>
  );
}
