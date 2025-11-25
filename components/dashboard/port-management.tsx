"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { PortDialog } from "@/components/dashboard/port-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getPorts, createPort, updatePort, deletePort, getProjectsUsingPort } from "@/app/actions/ports";
import { CellContext } from "@tanstack/react-table";

// Define types
interface PortFromServer {
  id: string;
  port: number;
  created_at?: Date;
  updated_at?: Date;
}

interface Port {
  id?: string;
  port: number;
  created_at?: Date;
  updated_at?: Date;
  projects?: {
    id: string;
    activation_key: string;
  }[];
}

// Define columns for the data table
const columns = [
  {
    accessorKey: "port",
    header: "Port Number",
    cell: ({ row }: CellContext<Port, unknown>) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${row.original.port || 'P'}`}/>
          <AvatarFallback>{row.original.port ? row.original.port.toString().charAt(0) : 'P'}</AvatarFallback>
        </Avatar>
        <span>{row.original.port || 'N/A'}</span>
      </div>
    ),
  },
  {
    accessorKey: "projects",
    header: "Projects Using This Port",
    cell: ({ row }: CellContext<Port, unknown>) => (
      <div className="flex flex-wrap gap-1">
        {row.original.projects && row.original.projects.length > 0 ? (
          row.original.projects.map((project) => (
            <span 
              key={project.id} 
              className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
            >
              {project.activation_key}
            </span>
          ))
        ) : (
          <span className="text-gray-500">No projects</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }: CellContext<Port, unknown>) => (
      <span>{row.original.created_at ? new Date(row.original.created_at).toLocaleString() : 'N/A'}</span>
    ),
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ row }: CellContext<Port, unknown>) => (
      <span>{row.original.updated_at ? new Date(row.original.updated_at).toLocaleString() : 'N/A'}</span>
    ),
  },
];

export function PortManagement() {
  const [ports, setPorts] = useState<Port[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);

  // Fetch ports from server
  useEffect(() => {
    const fetchPorts = async () => {
      try {
        const result = await getPorts();
        if (result.success) {
          // For each port, fetch the projects that use it
          const portsWithData = await Promise.all(
            (result.ports || []).map(async (port: PortFromServer) => {
              const projectsResult = await getProjectsUsingPort(port.id!);
              return {
                ...port,
                projects: projectsResult.success ? projectsResult.projects : [],
              };
            })
          );
          setPorts(portsWithData);
        } else {
          console.error('Failed to fetch ports:', result.error);
        }
      } catch (error) {
        console.error('Error fetching ports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPorts();
  }, []);

  const handleEdit = (port: Port) => {
    setEditingPort(port);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingPort(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (port: Port) => {
    if (!port.id) return;
    
    if (window.confirm(`Are you sure you want to delete port ${port.port}?`)) {
      try {
        const result = await deletePort(port.id);
        if (result.success) {
          setPorts(ports.filter(p => p.id !== port.id));
        } else {
          console.error('Failed to delete port:', result.error);
          alert('Failed to delete port: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting port:', error);
        alert('Error deleting port');
      }
    }
  };

  const handleAdvancedView = (port: Port) => {
    console.log("Advanced view for:", port);
    // In a real app, this would navigate to a detailed view
  };

  const handleSavePort = async (port: Port) => {
    try {
      let result: { success: boolean; port?: PortFromServer; error?: string };
      
      if (port.id) {
        // Update existing port
        const { id, port: portNumber } = port;
        result = await updatePort({ id, port: portNumber });
        if (result.success) {
          // Refresh the port data including projects
          const projectsResult = await getProjectsUsingPort(result.port!.id);
          const updatedPort = {
            ...result.port!,
            projects: projectsResult.success ? projectsResult.projects : [],
          };
          setPorts(ports.map(p => p.id === port.id ? updatedPort : p));
        }
      } else {
        // Add new port
        const { port: portNumber } = port;
        result = await createPort({ port: portNumber });
        if (result.success) {
          // New port won't have projects yet
          const newPort = {
            ...result.port!,
            projects: [],
          };
          setPorts([...ports, newPort]);
        }
      }
      
      if (result.success) {
        setIsDialogOpen(false);
        setEditingPort(null);
      } else {
        console.error('Failed to save port:', result.error);
        alert('Failed to save port: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving port:', error);
      alert('Error saving port');
    }
  };

  if (loading) {
    return <div>Loading ports...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Port Management</h1>
        <Button onClick={handleAdd}>Add Port</Button>
      </div>
      
      <div className="bg-white rounded-lg border-0">
        <DataTable 
          columns={columns} 
          data={ports} 
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onAdvancedView={handleAdvancedView}
          tableName="ports"
        />
      </div>

      <PortDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        port={editingPort || undefined}
        onSave={handleSavePort}
      />
    </>
  );
}