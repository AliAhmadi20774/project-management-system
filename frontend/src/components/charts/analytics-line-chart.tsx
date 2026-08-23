"use client";

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const config = {
  visitors: { label: "Visitors", color: "var(--chart-1)" },
  pageviews: { label: "Page Views", color: "var(--chart-2)" },
} satisfies ChartConfig;

// A believable 30-day trend of visitors and page views.
const base = [
  2140, 2380, 2210, 2560, 2890, 2470, 2050, 2320, 2680, 2910, 3120, 2870,
  2640, 2980, 3340, 3610, 3280, 2960, 3180, 3520, 3810, 3640, 3290, 3480,
  3760, 4020, 3880, 3560, 3920, 4180,
];

const data = base.map((visitors, i) => ({
  day: `${i + 1}`,
  visitors,
  pageviews: Math.round(visitors * (2.4 + ((i % 5) * 0.06))),
}));

export function AnalyticsLineChart() {
  return (
    <ChartContainer config={config} className="aspect-auto h-[300px] w-full">
      <LineChart data={data} margin={{ left: 4, right: 8, top: 8 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          tickMargin={10}
          interval={4}
          tickFormatter={(v) => `Jun ${v}`}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={44}
          tickFormatter={(v) => `${v / 1000}k`}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" />}
        />
        <Line
          dataKey="pageviews"
          type="monotone"
          stroke="var(--chart-2)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          dataKey="visitors"
          type="monotone"
          stroke="var(--chart-1)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ChartContainer>
  );
}
