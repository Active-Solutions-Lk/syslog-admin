"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { CollectorDialog } from "@/components/dashboard/collector-dialog";
import { ServerHealthDialog } from "@/components/dashboard/server-health-dialog";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { getCollectors, createCollector, updateCollector, deleteCollector } from "@/app/actions/collectors";
import { CellContext } from "@tanstack/react-table";

interface Collector {
  id?: string;
  name?: string | null;
  ip?: string | null;
  domain?: string | null;
  secret_key?: string | null;
  is_active: boolean;
}

const columns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: CellContext<Collector, unknown>) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{row.original.name?.charAt(0) || 'C'}</AvatarFallback>
        </Avatar>
        <span>{row.original.name || 'N/A'}</span>
      </div>
    ),
  },
  { accessorKey: "ip", header: "IP Address" },
  { accessorKey: "domain", header: "Domain" },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }: CellContext<Collector, unknown>) => (
      <div className="flex items-center gap-2">
        <Switch checked={row.original.is_active} disabled />
        <span className="text-sm">{row.original.is_active ? 'Active' : 'Inactive'}</span>
      </div>
    ),
  },
];

export function CollectorManagement() {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollector, setEditingCollector] = useState<Collector | null>(null);
  const [healthDialogState, setHealthDialogState] = useState<{ open: boolean, id: string | null, name: string }>({ open: false, id: null, name: '' });

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getCollectors();
        if (result.success) setCollectors((result.collectors || []) as any);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleEdit = (c: Collector) => {
    setEditingCollector(c);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCollector(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (c: Collector) => {
    if (!c.id) return;
    if (window.confirm(`Delete collector ${c.name}?`)) {
      const result = await deleteCollector(c.id);
      if (result.success) {
        setCollectors(collectors.filter(p => p.id !== c.id));
      } else {
        // Show error if collector is linked to a project
        alert(result.error);
      }
    }
  };

  const handleSave = async (data: Collector) => {
    let result;
    if (data.id) {
      result = await updateCollector(data.id, data as any);
    } else {
      result = await createCollector(data as any);
    }

    if (result.success) {
      const refreshed = await getCollectors();
      if (refreshed.success) setCollectors((refreshed.collectors || []) as any);
      setIsDialogOpen(false);
      setEditingCollector(null);
    } else {
      alert('Error: ' + result.error);
    }
  };

  const handleHealthCheck = (c: Collector) => {
    if (c.id) {
      setHealthDialogState({ open: true, id: c.id, name: c.name || 'Collector' });
    }
  };

  if (loading) return <div>Loading collectors...</div>;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Collector Management</h1>
      </div>
      <div className="bg-white rounded-lg border-0 mt-4">
        <DataTable columns={columns} data={collectors} onEdit={handleEdit} onAdd={handleAdd} onDelete={handleDelete} onHealthCheck={handleHealthCheck} tableName="collectors" />
      </div>
      <CollectorDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} collector={editingCollector as any || undefined} onSave={handleSave} />
      <ServerHealthDialog
        open={healthDialogState.open}
        onOpenChange={(open) => setHealthDialogState(prev => ({ ...prev, open }))}
        type="collector"
        serverId={healthDialogState.id}
        serverName={healthDialogState.name}
      />
    </>
  );
}