"use client";

import { useReducedMotion } from "framer-motion";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { assetBySymbol } from "@/data/assets";
import { formatPercent } from "@/lib/format";

const FALLBACK_COLORS = ["#6878e0", "#8848f0", "#e89838", "#6ad09d", "#7eb6d6", "#f5d76e"];

export function AllocationChart({
  slices,
}: {
  slices: { symbol: string; name: string; percent: number; value: number }[];
}) {
  const reduce = useReducedMotion();
  const summary = slices.map((slice) => `${slice.name} ${formatPercent(slice.percent)}`).join(", ");

  if (slices.length === 0) {
    return <p className="text-sm text-muted">Add a holding to see allocation.</p>;
  }

  return (
    <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
      <div className="mx-auto h-[180px] w-[180px]" role="img" aria-label={`Allocation chart. ${summary}.`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={slices}
              dataKey="value"
              nameKey="symbol"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={2}
              stroke="none"
              isAnimationActive={!reduce}
            >
              {slices.map((slice, index) => (
                <Cell
                  key={slice.symbol}
                  fill={assetBySymbol(slice.symbol)?.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div>
        <ul className="space-y-2">
          {slices.map((slice, index) => (
            <li key={slice.symbol} className="grid grid-cols-[auto_1fr_auto] items-center gap-3 text-sm">
              <span
                className="size-2.5 rounded-full"
                style={{ background: assetBySymbol(slice.symbol)?.color ?? FALLBACK_COLORS[index % FALLBACK_COLORS.length] }}
                aria-hidden
              />
              <span>{slice.symbol}</span>
              <span className="tabular-nums text-muted">{formatPercent(slice.percent)}</span>
            </li>
          ))}
        </ul>
        <p className="sr-only">{summary}</p>
      </div>
    </div>
  );
}
