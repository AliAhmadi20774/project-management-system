"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Label,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  XAxis,
  YAxis,
} from "recharts";

import { PageHeader } from "@/components/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  revenueByMonth,
  visitorsByDay,
  trafficSources,
  salesByCategory,
} from "@/data";

// --- Area: revenue over the year -------------------------------------------
const areaConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
} satisfies ChartConfig;

// --- Bar: stacked visitors by device ---------------------------------------
const barConfig = {
  desktop: { label: "Desktop", color: "var(--chart-1)" },
  mobile: { label: "Mobile", color: "var(--chart-3)" },
} satisfies ChartConfig;

// --- Line: revenue vs profit -----------------------------------------------
const lineConfig = {
  revenue: { label: "Revenue", color: "var(--chart-1)" },
  profit: { label: "Profit", color: "var(--chart-2)" },
} satisfies ChartConfig;

// --- Pie (donut): traffic sources ------------------------------------------
const pieConfig = {
  value: { label: "Visitors" },
  Organic: { label: "Organic", color: "var(--chart-1)" },
  Direct: { label: "Direct", color: "var(--chart-2)" },
  Referral: { label: "Referral", color: "var(--chart-3)" },
  Social: { label: "Social", color: "var(--chart-4)" },
  Email: { label: "Email", color: "var(--chart-5)" },
} satisfies ChartConfig;

const trafficTotal = trafficSources.reduce((a, b) => a + b.value, 0);

// --- Radial: sales by category ---------------------------------------------
const salesData = salesByCategory.map((s, i) => ({
  ...s,
  fill: `var(--chart-${i + 1})`,
}));

const radialConfig = {
  value: { label: "Share" },
  Electronics: { label: "Electronics", color: "var(--chart-1)" },
  Apparel: { label: "Apparel", color: "var(--chart-2)" },
  Home: { label: "Home", color: "var(--chart-3)" },
  Beauty: { label: "Beauty", color: "var(--chart-4)" },
  Other: { label: "Other", color: "var(--chart-5)" },
} satisfies ChartConfig;

// --- Radar: product scorecard ----------------------------------------------
const radarData = [
  { metric: "Performance", current: 88, target: 95 },
  { metric: "Reliability", current: 74, target: 90 },
  { metric: "Security", current: 92, target: 96 },
  { metric: "Usability", current: 81, target: 85 },
  { metric: "Scalability", current: 69, target: 82 },
  { metric: "Support", current: 85, target: 88 },
];

const radarConfig = {
  current: { label: "Current", color: "var(--chart-1)" },
  target: { label: "Target", color: "var(--chart-2)" },
} satisfies ChartConfig;

export default function ChartsExamplePage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Charts"
        description="A gallery of recharts visualizations wrapped in the shadcn chart primitives — themed for light and dark."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Area */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue trend</CardTitle>
            <CardDescription>Monthly revenue across the year</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={areaConfig} className="aspect-auto h-[260px] w-full">
              <AreaChart data={revenueByMonth} margin={{ left: 4, right: 8, top: 8 }}>
                <defs>
                  <linearGradient id="fillRevenueArea" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={44}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
                <Area
                  dataKey="revenue"
                  type="monotone"
                  fill="url(#fillRevenueArea)"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Stacked Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Visitors by device</CardTitle>
            <CardDescription>Desktop vs mobile sessions this week</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={barConfig} className="aspect-auto h-[260px] w-full">
              <BarChart data={visitorsByDay} margin={{ left: 8, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={44}
                  tickFormatter={(v) => (v >= 1000 ? `${v / 1000}k` : `${v}`)}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Bar dataKey="desktop" stackId="a" fill="var(--chart-1)" radius={[0, 0, 4, 4]} />
                <Bar dataKey="mobile" stackId="a" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Line */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue vs profit</CardTitle>
            <CardDescription>Gross revenue and net profit by month</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={lineConfig} className="aspect-auto h-[260px] w-full">
              <LineChart data={revenueByMonth} margin={{ left: 4, right: 8, top: 8 }}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  width={44}
                  tickFormatter={(v) => `$${v / 1000}k`}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                <ChartLegend content={<ChartLegendContent />} />
                <Line
                  dataKey="revenue"
                  type="monotone"
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  dataKey="profit"
                  type="monotone"
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Donut Pie */}
        <Card>
          <CardHeader>
            <CardTitle>Traffic sources</CardTitle>
            <CardDescription>Where this week&apos;s visitors came from</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pieConfig} className="mx-auto aspect-auto h-[260px]">
              <PieChart>
                <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                <Pie
                  data={trafficSources}
                  dataKey="value"
                  nameKey="source"
                  innerRadius={60}
                  outerRadius={100}
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
                              {(trafficTotal / 1000).toFixed(1)}k
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
                <ChartLegend content={<ChartLegendContent nameKey="source" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Radial Bar */}
        <Card>
          <CardHeader>
            <CardTitle>Sales by category</CardTitle>
            <CardDescription>Share of revenue per product category</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={radialConfig} className="mx-auto aspect-auto h-[260px]">
              <RadialBarChart
                data={salesData}
                innerRadius={30}
                outerRadius={110}
                startAngle={90}
                endAngle={-270}
              >
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel nameKey="category" />}
                />
                <RadialBar dataKey="value" background cornerRadius={6} />
                <ChartLegend content={<ChartLegendContent nameKey="category" />} />
              </RadialBarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Radar */}
        <Card>
          <CardHeader>
            <CardTitle>Product scorecard</CardTitle>
            <CardDescription>Current health against target across metrics</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={radarConfig} className="mx-auto aspect-auto h-[260px]">
              <RadarChart data={radarData}>
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" />
                <Radar
                  dataKey="current"
                  fill="var(--chart-1)"
                  fillOpacity={0.5}
                  stroke="var(--chart-1)"
                  strokeWidth={2}
                />
                <Radar
                  dataKey="target"
                  fill="var(--chart-2)"
                  fillOpacity={0.1}
                  stroke="var(--chart-2)"
                  strokeWidth={2}
                />
                <ChartLegend content={<ChartLegendContent />} />
              </RadarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
