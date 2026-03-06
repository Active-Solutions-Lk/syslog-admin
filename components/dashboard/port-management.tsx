"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { PortDialog } from "@/components/dashboard/port-dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { getPorts, createPort, updatePort, deletePort } from "@/app/actions/ports";
import { CellContext } from "@tanstack/react-table";

interface Port {
  id?: string;
  port: number;
}

const columns = [
  {
    accessorKey: "port",
    header: "Port Number",
    cell: ({ row }: CellContext<Port, unknown>) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{row.original.port?.toString().charAt(0) || 'P'}</AvatarFallback>
        </Avatar>
        <span>{row.original.port || 'N/A'}</span>
      </div>
    ),
  },
];

export function PortManagement() {
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const result = await getPorts();
        if (result.success) setPorts(result.ports || []);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const handleEdit = (p: Port) => {
    setEditingPort(p);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingPort(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (p: Port) => {
    if (!p.id) return;
    if (window.confirm(`Delete port ${p.port}?`)) {
      const result = await deletePort(p.id);
      if (result.success) setPorts(ports.filter(x => x.id !== p.id));
    }
  };

  const handleSave = async (data: Port) => {
    let result;
    if (data.id) {
      result = await updatePort({ id: data.id, port: data.port });
    } else {
      result = await createPort({ port: data.port });
    }

    if (result.success) {
      const refreshed = await getPorts();
      if (refreshed.success) setPorts(refreshed.ports || []);
      setIsDialogOpen(false);
      setEditingPort(null);
    } else {
      alert('Error: ' + result.error);
    }
  };

  if (loading) return <div>Loading ports...</div>;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Port Management</h1>
      </div>
      <div className="bg-white rounded-lg border-0 mt-4">
        <DataTable columns={columns} data={ports} onEdit={handleEdit} onAdd={handleAdd} onDelete={handleDelete} tableName="ports" />
      </div>
      <PortDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} port={editingPort || undefined} onSave={handleSave} />
    </>
  );
}