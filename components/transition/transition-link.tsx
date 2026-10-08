"use client";

import Link from "next/link";
import type { MouseEvent } from "react";
import { useAppTransition } from "@/components/transition/app-transition";

export function TransitionLink({
  href,
  onClick,
  ...props
}: React.ComponentProps<typeof Link>) {
  const { go } = useAppTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    if (typeof href !== "string") return;
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    go(href);
  };

  return (
    <Link href={href} onClick={handleClick} {...props} />
  );
}
