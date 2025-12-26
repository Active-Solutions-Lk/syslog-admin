"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
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

// Define the data structure for our API log data
interface ChartDataPoint {
  date: string;
  value: number;
}

interface ApiLogChartProps {
  chartData?: ChartDataPoint[];
  title?: string;
  description?: string;
}

export function ApiLogChart({ 
  chartData = [], 
  title = "API Log Data", 
  description = "Metrics over time"
}: ApiLogChartProps) {
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

  // Chart configuration specific to our API logs
  const chartConfig = {
    value: {
      label: title,
      color: "var(--chart-1)",
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
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="fillValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-value)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
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
              domain={[0, 'dataMax']}
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
            <Area
              dataKey="value"
              type="monotone"
              fill="url(#fillValue)"
              stroke="var(--color-value)"
              strokeWidth={2}
              name={title}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}