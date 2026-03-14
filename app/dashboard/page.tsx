"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { getProjects } from "@/app/actions/project";
import { getCollectors } from "@/app/actions/collectors";
import { getAnalyzers } from "@/app/actions/analyzers";
import { getResellers } from "@/app/actions/reseller";
import { getEndCustomers } from "@/app/actions/end-customer";
import { getDevices } from "@/app/actions/devices";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Pie, PieChart, Cell, Legend, Bar, BarChart, XAxis, YAxis } from "recharts";
import { RamBarChart } from "@/components/dashboard/ram-bar-chart";
import { LogCountRadialChart } from "@/components/dashboard/log-count-radial-chart";

import {
  FolderOpen,
  Cpu,
  Activity,
  UserCheck,
  Building,
} from "lucide-react";

export default function DashboardPage() {
  // 1. Data State: We store all arrays fetched from the backend so we can compute charts
  const [data, setData] = useState({
    projects: [] as any[],
    collectors: [] as any[],
    analyzers: [] as any[],
    resellers: [] as any[],
    customers: [] as any[],
    devices: [] as any[]
  });

  // 2. Data Fetching
  useEffect(() => {
    const fetch = async () => {
      const [p, c, a, r, ec, d] = await Promise.all([
        getProjects(),
        getCollectors(),
        getAnalyzers(),
        getResellers(),
        getEndCustomers(),
        getDevices()
      ]);

      setData({
        projects: p.success ? p.projects || [] : [],
        collectors: c.success ? c.collectors || [] : [],
        analyzers: a.success ? a.analyzers || [] : [],
        resellers: r.success ? r.resellers || [] : [],
        customers: ec.success ? ec.customers || [] : [],
        devices: d.success ? d.devices || [] : []
      });
    };
    fetch();
  }, []);

  // -------------------------------------------------------------
  // 3. WIDGET DATA CALCULATIONS
  // -------------------------------------------------------------

  // Top metric cards
  const cards = [
    { title: "Total Projects", value: data.projects.length, icon: FolderOpen, color: "text-blue-600", href: "/dashboard/projects" },
    { title: "Collectors", value: data.collectors.length, icon: Activity, color: "text-green-600", href: "/dashboard/collectors" },
    { title: "Analyzers", value: data.analyzers.length, icon: Cpu, color: "text-purple-600", href: "/dashboard/analyzers" },
    { title: "Resellers", value: data.resellers.length, icon: UserCheck, color: "text-orange-600", href: "/dashboard/resellers" },
    { title: "End Customers", value: data.customers.length, icon: Building, color: "text-cyan-600", href: "/dashboard/end-customer" },
  ];

  // A. Projects by Type (Pie Chart)
  // Reduces the array of projects into a count per project type name
  const projectTypesCount = data.projects.reduce((acc, p) => {
    const typeName = p.project_types?.type || "Unknown";
    acc[typeName] = (acc[typeName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieColors = ["#3b82f6", "#8b5cf6", "#06b6d4", "#f59e0b", "#10b981", "#ef4444"];
  const projectsByType = Object.entries(projectTypesCount).map(([name, value], idx) => ({
    name,
    value,
    fill: pieColors[idx % pieColors.length]
  }));

  // B. Device Keys Expiring Soon (Table)
  // Filters keys that will expire within the next 30 days
  const expiringDevices = data.devices.filter(d => {
    if (!d.package_end_at) return false;
    const end = new Date(d.package_end_at);
    const daysLeft = (end.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24);
    return daysLeft >= 0 && daysLeft <= 60; // Extended to 60 days to show more activity
  });

  // C. Projects Created Over Time (Bar Chart)
  // Reusing RamBarChart component structure you already have
  const projectsByMonth = data.projects.reduce((acc, p) => {
    if (!p.created_at) return acc;
    const month = format(new Date(p.created_at), "MMM yyyy");
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const projectsTimelineData = Object.entries(projectsByMonth).map(([month, count]) => ({
    date: month,
    value: count as number,
  }));

  // D. Collector Load Distribution
  // Who has the most projects mapped?
  const collectorLoad = data.collectors.map(c => ({
    name: c.name,
    projects: data.projects.filter(p => p.collector_id === c.id).length,
  })).sort((a, b) => b.projects - a.projects).slice(0, 5); // top 5 only

  // E. Entity Health
  // Calculating active entities vs total to plot as smooth progress bars
  const activeResellers = data.resellers.filter(r => r.status === true).length;
  const resellersPct = data.resellers.length > 0 ? Math.round((activeResellers / data.resellers.length) * 100) : 0;

  const activeCustomers = data.customers.filter(c => c.status === true).length;
  const customersPct = data.customers.length > 0 ? Math.round((activeCustomers / data.customers.length) * 100) : 0;

  const activeCollectors = data.collectors.filter(c => c.is_active === true).length;
  const collectorsPct = data.collectors.length > 0 ? Math.round((activeCollectors / data.collectors.length) * 100) : 0;

  const activeAnalyzers = data.analyzers.filter(a => a.status === true).length;
  const analyzersPct = data.analyzers.length > 0 ? Math.round((activeAnalyzers / data.analyzers.length) * 100) : 0;

  // F. Recent Projects (Table)
  // Slice to last 5 descending
  const recentProjects = [...data.projects].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  ).slice(0, 5);

  // G. Device Key Usage (Radial Chart)
  // Overall system capacity
  const totalDeviceSlots = data.projects.reduce((sum, p) => sum + (p.device_count || 0), 0);
  const totalDevicesCreated = data.devices.length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>

      {/* Row 1: Summary Stat Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {cards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="cursor-pointer hover:shadow-md transition">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className={`h-4 w-4 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Row 2: Projects By Type (Pie) & Expiring Keys (Table) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">Projects by Type</CardTitle>
            <CardDescription className="text-xs">Distribution of active architectures</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="mx-auto aspect-[4/3] max-h-[250px]">
              <PieChart>
                <Pie data={projectsByType} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={2}>
                  {projectsByType.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend className="text-sm" />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-4 overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-sm">⚠️ Device Keys Expiring Soon</CardTitle>
            <CardDescription className="text-xs">Identified expiring within 60 days</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Device Key</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expiringDevices.length > 0 ? (
                  expiringDevices.map(d => {
                    // Check if it's already expired to switch badge red vs orange
                    const isExpired = new Date(d.package_end_at).getTime() < new Date().getTime();
                    return (
                      <TableRow key={d.id}>
                        <TableCell className="font-medium text-xs">
                          {d.projects?.activation_key || "Unlinked"}
                        </TableCell>
                        <TableCell className="font-mono text-xs">{d.device_key.substring(0, 8)}...</TableCell>
                        <TableCell className="text-xs">{format(new Date(d.package_end_at), "MMM d, yyyy")}</TableCell>
                        <TableCell>
                          <Badge variant={isExpired ? "destructive" : "secondary"} className={!isExpired ? "bg-orange-100 text-orange-800" : ""}>
                            {isExpired ? "Expired" : "Expiring"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                ) : (
                  <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-6">No keys expiring soon.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Projects Timeline (Bar Chart) & Entity Health */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* <div className="lg:col-span-4">
          <RamBarChart
            chartData={projectsTimelineData}
            title="Projects Growth"
            description="Projects created over time"
          />
        </div> */}

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-sm">Entity Health</CardTitle>
            <CardDescription className="text-xs">Active vs Inactive configuration ratios</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span>Resellers</span>
                <span className="text-muted-foreground">{activeResellers}/{data.resellers.length} active</span>
              </div>
              <Progress value={resellersPct} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span>End Customers</span>
                <span className="text-muted-foreground">{activeCustomers}/{data.customers.length} active</span>
              </div>
              <Progress value={customersPct} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span>Collectors</span>
                <span className="text-muted-foreground">{activeCollectors}/{data.collectors.length} active</span>
              </div>
              <Progress value={collectorsPct} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span>Analyzers</span>
                <span className="text-muted-foreground">{activeAnalyzers}/{data.analyzers.length} active</span>
              </div>
              <Progress value={analyzersPct} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Row 4: Key Slots (Radial) & Recent Projects (Table) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* <div className="lg:col-span-2"> */}
          {/* Re-using the built-in Radial component. Passes data mathematically */}
          {/* <LogCountRadialChart
            chartData={{
              used: totalDevicesCreated,
              quota: totalDeviceSlots,
              fill: "hsl(var(--chart-1))"
            }}
            title="Device Key Capacity"
            description="Deployed vs Total Allowance"
          />
        </div> */}

        <Card className="lg:col-span-5 overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-sm">Recent Projects</CardTitle>
            <CardDescription className="text-xs">Most recently configured systems</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Activation Key</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Collector</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentProjects.length > 0 ? recentProjects.map(p => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Badge variant="outline">{p.activation_key}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{p.project_types?.type || "N/A"}</TableCell>
                    <TableCell className="text-xs font-medium">{p.collectors?.name || "N/A"}</TableCell>
                    <TableCell className="text-xs">{p.end_customer?.company || "N/A"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{format(new Date(p.created_at), "MMM d, yyyy")}</TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-6">No projects found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}