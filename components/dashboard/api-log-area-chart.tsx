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

interface ChartDataPoint {
  timestamp: string;
  value: number;
}

interface ApiLogAreaChartProps {
  title: string;
  description: string;
  data: ChartDataPoint[];
  dataKey: string;
  color: string;
  height?: number;
}

export function ApiLogAreaChart({
  title,
  description,
  data,
  dataKey,
  color,
  height = 200,
}: ApiLogAreaChartProps) {
  // Create a gradient ID based on the color
  const gradientId = `gradient-${dataKey}-${color.replace('#', '')}`;
  
  const chartConfig = {
    [dataKey]: {
      label: title,
      color: color,
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