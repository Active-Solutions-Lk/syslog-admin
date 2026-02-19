"use client";

import { useState, useEffect } from "react";
import { getProjects } from "@/app/actions/project";
import { getCollectors } from "@/app/actions/collectors";
import { getAnalyzers } from "@/app/actions/analyzers";
import { getResellers } from "@/app/actions/reseller";
import { getEndCustomers } from "@/app/actions/end-customer";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  FolderOpen,
  Cpu,
  Activity,
  UserCheck,
  Building,
} from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({
    projects: 0,
    collectors: 0,
    analyzers: 0,
    resellers: 0,
    customers: 0
  });

  useEffect(() => {
    const fetch = async () => {
      const [p, c, a, r, ec] = await Promise.all([
        getProjects(),
        getCollectors(),
        getAnalyzers(),
        getResellers(),
        getEndCustomers()
      ]);

      setStats({
        projects: p.success ? p.projects?.length || 0 : 0,
        collectors: c.success ? c.collectors?.length || 0 : 0,
        analyzers: a.success ? a.analyzers?.length || 0 : 0,
        resellers: r.success ? r.resellers?.length || 0 : 0,
        customers: ec.success ? ec.customers?.length || 0 : 0
      });
    };
    fetch();
  }, []);

  const cards = [
    { title: "Total Projects", value: stats.projects, icon: FolderOpen, color: "text-blue-600" },
    { title: "Collectors", value: stats.collectors, icon: Activity, color: "text-green-600" },
    { title: "Analyzers", value: stats.analyzers, icon: Cpu, color: "text-purple-600" },
    { title: "Resellers", value: stats.resellers, icon: UserCheck, color: "text-orange-600" },
    { title: "End Customers", value: stats.customers, icon: Building, color: "text-cyan-600" },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Dashboard Overview</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
