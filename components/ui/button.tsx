import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-primary text-white shadow-[0_8px_24px_rgba(130,92,237,0.28)] hover:bg-primary-bright",
  quiet: "bg-[#151a26] text-foreground hover:bg-[#1c2333]",
  ghost: "bg-transparent text-muted hover:bg-white/5 hover:text-foreground",
  outline: "border border-white/10 bg-transparent text-foreground hover:bg-white/5",
} as const;

export function Button({
  variant = "primary",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof variants }) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
