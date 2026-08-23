"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { salesByCategory } from "@/data";

const config = {
  value: { label: "Share", color: "var(--chart-1)" },
} satisfies ChartConfig;

export function CategoryBarChart() {
  return (
    <ChartContainer config={config} className="aspect-auto h-[280px] w-full">
      <BarChart
        data={salesByCategory}
        layout="vertical"
        margin={{ left: 8, right: 16, top: 4, bottom: 4 }}
      >
        <CartesianGrid horizontal={false} strokeDasharray="3 3" />
        <XAxis type="number" tickLine={false} axisLine={false} tickMargin={8} hide />
        <YAxis
          type="category"
          dataKey="category"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={88}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent formatter={(v) => `${v}%`} />}
        />
        <Bar dataKey="value" fill="var(--chart-1)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
