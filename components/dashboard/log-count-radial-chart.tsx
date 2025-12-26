"use client";

import { 
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
} from "@/components/ui/chart";

// Define the data structure for our log count data
interface LogCountData {
  used: number;
  quota: number;
  fill: string;
}

interface LogCountRadialChartProps {
  chartData?: LogCountData;
  title?: string;
  description?: string;
}

export function LogCountRadialChart({ 
  chartData = { used: 0, quota: 100, fill: "var(--chart-1)" },
  title = "Log Count",
  description = "Used logs vs allocated quota"
}: LogCountRadialChartProps) {
  // Calculate percentage
  const percentage = chartData.quota > 0 ? Math.round((chartData.used / chartData.quota) * 100) : 0;
  
  // Format data for the chart
  const data = [
    {
      used: chartData.used,
      quota: chartData.quota,
      fill: chartData.fill,
    }
  ];

  // Chart configuration
  const chartConfig = {
    used: {
      label: "Used Logs",
    },
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-sm">{title}</CardTitle>
        <CardDescription className="text-xs">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[200px]"
        >
          <RadialBarChart
            data={data}
            startAngle={90}
            endAngle={-270}
            innerRadius={80}
            outerRadius={110}
          >
            <PolarGrid
              gridType="circle"
              radialLines={false}
              stroke="none"
              className="first:fill-muted last:fill-background"
              polarRadius={[86, 74]}
            />
            <RadialBar 
              dataKey="used" 
              background 
              cornerRadius={10} 
              fill={chartData.fill}
            />
            <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-2xl font-bold"
                        >
                          {percentage}%
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 20}
                          className="fill-muted-foreground text-xs"
                        >
                          {chartData.used}/{chartData.quota}
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </PolarRadiusAxis>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <div className="text-center px-4 pb-4 text-xs text-muted-foreground">
        Logs used: {chartData.used} of {chartData.quota} allocated
      </div>
    </Card>
  );
}