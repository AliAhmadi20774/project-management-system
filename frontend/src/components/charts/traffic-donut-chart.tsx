"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { trafficSources } from "@/data";

const config = {
  value: { label: "Visitors" },
  Organic: { label: "Organic", color: "var(--chart-1)" },
  Direct: { label: "Direct", color: "var(--chart-2)" },
  Referral: { label: "Referral", color: "var(--chart-3)" },
  Social: { label: "Social", color: "var(--chart-4)" },
  Email: { label: "Email", color: "var(--chart-5)" },
} satisfies ChartConfig;

export function TrafficDonutChart() {
  const total = React.useMemo(
    () => trafficSources.reduce((a, b) => a + b.value, 0),
    []
  );

  return (
    <ChartContainer config={config} className="mx-auto aspect-square h-[240px]">
      <PieChart>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
        <Pie
          data={trafficSources}
          dataKey="value"
          nameKey="source"
          innerRadius={60}
          strokeWidth={4}
        >
          <Label
            content={({ viewBox }) => {
              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle">
                    <tspan
                      x={viewBox.cx}
                      y={viewBox.cy}
                      className="fill-foreground text-2xl font-semibold"
                    >
                      {(total / 1000).toFixed(1)}k
                    </tspan>
                    <tspan
                      x={viewBox.cx}
                      y={(viewBox.cy || 0) + 20}
                      className="fill-muted-foreground text-xs"
                    >
                      Visitors
                    </tspan>
                  </text>
                );
              }
            }}
          />
        </Pie>
      </PieChart>
    </ChartContainer>
  );
}
