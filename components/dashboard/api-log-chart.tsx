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

export interface ChartDataPoint {
  timestamp: string;
  value: number;
}

interface ApiLogChartProps {
  data?: ChartDataPoint[];
  title?: string;
  description?: string;
  dataKey?: string;
  color?: string;
  height?: number;
}

export function ApiLogChart({
  data = [],
  title = "API Log Data",
  description = "Metrics over time",
  dataKey = "value",
  color = "#3b82f6", // Default blue color
  height = 200
}: ApiLogChartProps) {
  // Create a gradient ID based on the color
  const gradientId = `gradient-${dataKey}-${color.replace('#', '')}`;

  const chartConfig = {
    [dataKey]: {
      label: title,
      color: color,
    },
  };

  // If no data, show a message
  if (!data || data.length === 0) {
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
          className={`aspect-auto h-[${height}px] w-full`}
        >
          <AreaChart data={data}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={color}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={color}
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="timestamp"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
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
              content={<ChartTooltipContent indicator="dot" />}
            />
            <Area
              dataKey="value"
              type="monotone"
              fill={`url(#${gradientId})`}
              stroke={color}
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}