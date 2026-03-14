"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { AnalyzerDialog } from "@/components/dashboard/analyzer-dialog";
import { ServerHealthDialog } from "@/components/dashboard/server-health-dialog";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { getAnalyzers, createAnalyzer, updateAnalyzer, deleteAnalyzer } from "@/app/actions/analyzers";
import { CellContext } from "@tanstack/react-table";

interface Analyzer {
  id?: string;
  name: string;
  ip: string | null;
  domain: string | null;
  status: boolean;
}

const columns = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "ip", header: "IP Address" },
  { accessorKey: "domain", header: "Domain" },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: CellContext<Analyzer, unknown>) => (
      <div className="flex items-center gap-2">
        <Switch checked={row.original.status} disabled />
        <span className="text-sm">{row.original.status ? 'Active' : 'Inactive'}</span>
      </div>
    ),
  },
];

export function AnalyzerManagement() {
  const [analyzers, setAnalyzers] = useState<Analyzer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnalyzer, setEditingAnalyzer] = useState<Analyzer | null>(null);
  const [healthDialogState, setHealthDialogState] = useState<{ open: boolean, id: string | null, name: string }>({ open: false, id: null, name: '' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getAnalyzers();
        if (result.success) setAnalyzers((result.analyzers || []) as any);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleEdit = (a: Analyzer) => {
    setEditingAnalyzer(a);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingAnalyzer(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (a: Analyzer) => {
    if (!a.id) return;
    if (window.confirm(`Delete analyzer ${a.name}?`)) {
      const result = await deleteAnalyzer(a.id);
      if (result.success) {
        setAnalyzers(analyzers.filter(p => p.id !== a.id));
      } else {
        // Display error if analyzer is linked to a project
        alert(result.error);
      }
    }
  };

  const handleSave = async (data: Analyzer) => {
    let result;
    if (data.id) {
      result = await updateAnalyzer({ ...data, id: data.id });
    } else {
      result = await createAnalyzer(data);
    }

    if (result.success) {
      const refreshed = await getAnalyzers();
      if (refreshed.success) setAnalyzers((refreshed.analyzers || []) as any);
      setIsDialogOpen(false);
      setEditingAnalyzer(null);
    } else {
      alert('Error: ' + result.error);
    }
  };

  const handleHealthCheck = (a: Analyzer) => {
    if (a.id) {
      setHealthDialogState({ open: true, id: a.id, name: a.name });
    }
  };

  if (loading) return <div>Loading analyzers...</div>;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analyzer Management</h1>
      </div>
      <div className="bg-white rounded-lg border-0 mt-4">
        <DataTable columns={columns} data={analyzers} onEdit={handleEdit} onAdd={handleAdd} onDelete={handleDelete} onHealthCheck={handleHealthCheck} tableName="analyzers" />
      </div>
      <AnalyzerDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} analyzer={editingAnalyzer as any || undefined} onSave={handleSave} />
      <ServerHealthDialog
        open={healthDialogState.open}
        onOpenChange={(open) => setHealthDialogState(prev => ({ ...prev, open }))}
        type="analyzer"
        serverId={healthDialogState.id}
        serverName={healthDialogState.name}
      />
    </>
  );
}