"use client";

import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { getCollectorHealth, getAnalyzerHealth } from "@/app/actions/server-health";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Label } from "recharts";
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

interface ServerHealthDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    type: 'collector' | 'analyzer';
    serverId: number | string | null;
    serverName?: string;
}

export function ServerHealthDialog({ open, onOpenChange, type, serverId, serverName }: ServerHealthDialogProps) {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (open && serverId) {
            setLoading(true);
            const fetchData = async () => {
                let result;
                if (type === 'collector') {
                    result = await getCollectorHealth(serverId);
                } else {
                    result = await getAnalyzerHealth(serverId);
                }
                if (result.success && result.data) {
                    setData(result.data);
                }
                setLoading(false);
            };
            fetchData();
        }
    }, [open, type, serverId]);

    const latest = data.length > 0 ? data[data.length - 1] : { cpu_load: 0, ram_load: 0, disk_capacity: 0 };

    // Format data for charts
    const chartData = data.map(d => ({
        timestamp: new Date(d.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        cpu: d.cpu_load,
        ram: d.ram_load,
        disk: d.disk_capacity
    }));

    const diskData = [
        { name: "Used", value: latest.disk_capacity, fill: "hsl(var(--chart-1))" },
        { name: "Free", value: Math.max(0, 100 - latest.disk_capacity), fill: "hsl(var(--muted))" },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-none !max-w-none w-screen h-screen flex flex-col p-0 gap-0 rounded-none border-none top-0 left-0 translate-x-0 translate-y-0" showCloseButton={false}>
                <DialogHeader className="p-6 pb-4 border-b bg-background sticky top-0 z-10 flex-shrink-0">
                    <div className="flex items-center justify-between w-full">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                            Server Health: {serverName || 'Unknown'}
                            <span className="text-sm font-normal text-muted-foreground capitalize">({type})</span>
                        </DialogTitle>
                        <button
                            onClick={() => onOpenChange(false)}
                            className="hover:bg-accent hover:text-accent-foreground p-2 rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                        </button>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto lg:overflow-hidden p-6 bg-muted/10 h-full">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">Loading health data...</div>
                    ) : (
                        <div className="flex flex-col h-full space-y-4 w-full px-4 md:px-10 lg:px-16 container-fluid">
                            {/* Key Metrics Cards */}
                            <div className="grid gap-4 md:grid-cols-3 shrink-0">
                                <HealthCard title="CPU Load" value={`${latest.cpu_load?.toFixed(1) || 0}%`} subtext="Current usage" indicatorColor={latest.cpu_load > 80 ? 'bg-destructive' : 'bg-green-500'} />
                                <HealthCard title="RAM Load" value={`${latest.ram_load?.toFixed(1) || 0}%`} subtext="Current usage" indicatorColor={latest.ram_load > 80 ? 'bg-orange-500' : 'bg-green-500'} />
                                <HealthCard title="Disk Usage" value={`${latest.disk_capacity?.toFixed(1) || 0}%`} subtext="Used space" indicatorColor={latest.disk_capacity > 90 ? 'bg-destructive' : 'bg-blue-500'} />
                            </div>

                            <div className="flex-1 min-h-0">
                                {/* History Chart */}
                                <Card className="h-full flex flex-col">
                                    <CardHeader className="py-3">
                                        <CardTitle className="text-base">Resource History (24h)</CardTitle>
                                        <CardDescription className="text-xs">CPU and RAM usage trends over time</CardDescription>
                                    </CardHeader>
                                    <CardContent className="flex-1 min-h-[300px] lg:min-h-0 pb-2">
                                        <ChartContainer config={{ cpu: { label: "CPU", color: "hsl(var(--chart-1))" }, ram: { label: "RAM", color: "hsl(var(--chart-2))" } }} className="h-full w-full">
                                            <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="fillCpu" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0.1} />
                                                    </linearGradient>
                                                    <linearGradient id="fillRam" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0.1} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                                                <XAxis dataKey="timestamp" tickLine={false} axisLine={false} tickMargin={8} minTickGap={32} />
                                                <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
                                                <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
                                                <Area type="monotone" dataKey="cpu" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#fillCpu)" />
                                                <Area type="monotone" dataKey="ram" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#fillRam)" />
                                            </AreaChart>
                                        </ChartContainer>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function HealthCard({ title, value, subtext, indicatorColor }: { title: string, value: string, subtext: string, indicatorColor: string }) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className={`h-2 w-2 rounded-full ${indicatorColor}`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{subtext}</p>
            </CardContent>
        </Card>
    );
}
