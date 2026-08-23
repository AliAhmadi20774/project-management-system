"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { visitorsByDay } from "@/data";

const config = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-3)" },
} satisfies ChartConfig;

export function VisitorsBarChart() {
  return (
    <ChartContainer config={config} className="aspect-auto h-[280px] w-full">
      <BarChart data={visitorsByDay} margin={{ top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
        <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
        <Bar dataKey="desktop" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
        <Bar dataKey="mobile" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}
