"use client";

import * as React from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

// Define the data structure for our RAM data
interface RamDataPoint {
  date: string;
  value: number;
}

interface RamBarChartProps {
  chartData?: RamDataPoint[];
  title?: string;
  description?: string;
}

export function RamBarChart({ 
  chartData = [], 
  title = "RAM Usage", 
  description = "RAM utilization over time"
}: RamBarChartProps) {
  // If no data, show a message
  if (!chartData || chartData.length === 0) {
    return (
      <Card className="pt-0">
        <CardHeader className="flex items-center gap-2 space-y-0 border-b py-3 sm:flex-row">
          <div className="grid flex-1 gap-1">
            <CardTitle className="text-sm">{title}</CardTitle>
            <CardDescription className="text-xs">
              {description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-2 pt-4 sm:px-4 sm:pt-6">
          <div className="flex items-center justify-center h-32">
            <p className="text-muted-foreground text-sm">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Chart configuration specific to our RAM usage
  const chartConfig = {
    value: {
      label: title,
      color: "var(--chart-2)",
    },
  };

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-3 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle className="text-sm">{title}</CardTitle>
          <CardDescription className="text-xs">
            {description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-2 sm:px-4 sm:pt-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[200px] w-full"
        >
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                // Format date as MM/DD
                if (value.includes('-')) {
                  const date = new Date(value);
                  return date.toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' });
                }
                return value;
              }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickCount={5}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Bar
              dataKey="value"
              fill="var(--color-value)"
              radius={4}
              name={title}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}