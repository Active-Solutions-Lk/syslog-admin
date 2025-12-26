"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { CollectorDialog } from "@/components/dashboard/collector-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { getCollectors, createCollector, updateCollector, deleteCollector, getProjectsUsingCollector } from "@/app/actions/collectors";
import { CellContext } from "@tanstack/react-table";

// Define types
interface CollectorFromServer {
  id: string;
  name: string | null;
  ip: string;
  domain: string | null;
  secret_key: string | null;
  last_fetched_id: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface Collector {
  id?: string;
  name: string;
  ip: string;
  domain: string;
  secret_key: string;
  last_fetched_id: number;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
  projects?: {
    id: string;
    activation_key: string;
  }[];
}

// Helper function to convert CollectorFromServer to Collector
const convertToCollector = (collectorFromServer: CollectorFromServer): Collector => {
  return {
    ...collectorFromServer,
    name: collectorFromServer.name || '',
    domain: collectorFromServer.domain || '',
    secret_key: collectorFromServer.secret_key || '',
  };
};

// Define columns for the data table
const columns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: CellContext<Collector, unknown>) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${row.original.name || 'C'}`}/>
          <AvatarFallback>{row.original.name ? row.original.name.charAt(0) : 'C'}</AvatarFallback>
        </Avatar>
        <span>{row.original.name || 'N/A'}</span>
      </div>
    ),
  },
  {
    accessorKey: "ip",
    header: "IP Address",
  },
  {
    accessorKey: "domain",
    header: "Domain",
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }: CellContext<Collector, unknown>) => (
      <div className="flex items-center">
        <Switch
          checked={row.original.is_active}
          disabled
        />
        <span className="ml-2">
          {row.original.is_active ? 'Active' : 'Inactive'}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "projects",
    header: "Projects Using This Collector",
    cell: ({ row }: CellContext<Collector, unknown>) => (
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
];

export function CollectorManagement() {
  const [collectors, setCollectors] = useState<Collector[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCollector, setEditingCollector] = useState<Collector | null>(null);

  // Fetch collectors from server
  useEffect(() => {
    const fetchCollectors = async () => {
      try {
        const result = await getCollectors();
        if (result.success) {
          // For each collector, fetch the projects that use it
          const collectorsWithData = await Promise.all(
            (result.collectors || []).map(async (collector: CollectorFromServer) => {
              const projectsResult = await getProjectsUsingCollector(collector.id!);
              const convertedCollector = convertToCollector(collector);
              return {
                ...convertedCollector,
                projects: projectsResult.success ? projectsResult.projects : [],
              };
            })
          );
          setCollectors(collectorsWithData);
        } else {
          console.error('Failed to fetch collectors:', result.error);
        }
      } catch (error) {
        console.error('Error fetching collectors:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCollectors();
  }, []);

  const handleEdit = (collector: Collector) => {
    setEditingCollector(collector);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCollector(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (collector: Collector) => {
    if (!collector.id) return;
    
    if (window.confirm(`Are you sure you want to delete collector ${collector.name}?`)) {
      try {
        const result = await deleteCollector(collector.id);
        if (result.success) {
          setCollectors(collectors.filter(p => p.id !== collector.id));
        } else {
          console.error('Failed to delete collector:', result.error);
          alert('Failed to delete collector: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting collector:', error);
        alert('Error deleting collector');
      }
    }
  };

  const handleAdvancedView = (collector: Collector) => {
    console.log("Advanced view for:", collector);
    // In a real app, this would navigate to a detailed view
  };

  const handleSaveCollector = async (collector: Collector) => {
    try {
      let result: { success: boolean; collector?: CollectorFromServer; error?: string };
      
      if (collector.id) {
        // Update existing collector
        const { id, name, ip, domain, secret_key, is_active } = collector;
        result = await updateCollector({ id, name, ip, domain, secret_key, is_active });
        if (result.success) {
          // Refresh the collector data including projects
          const projectsResult = await getProjectsUsingCollector(result.collector!.id);
          const updatedCollector = convertToCollector(result.collector!);
          updatedCollector.projects = projectsResult.success ? projectsResult.projects : [];
          setCollectors(collectors.map(p => p.id === collector.id ? updatedCollector : p));
        }
      } else {
        // Add new collector
        const { name, ip, domain, secret_key, is_active } = collector;
        result = await createCollector({ name, ip, domain, secret_key, is_active });
        if (result.success) {
          // New collector won't have projects yet
          const newCollector = convertToCollector(result.collector!);
          newCollector.projects = [];
          setCollectors([...collectors, newCollector]);
        }
      }
      
      if (result.success) {
        setIsDialogOpen(false);
        setEditingCollector(null);
      } else {
        console.error('Failed to save collector:', result.error);
        alert('Failed to save collector: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving collector:', error);
      alert('Error saving collector');
    }
  };

  if (loading) {
    return <div>Loading collectors...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Collector Management</h1>
        {/* <Button onClick={handleAdd}>Add Collector</Button> */}
      </div>
      
      <div className="bg-white rounded-lg border-0">
        <DataTable 
          columns={columns} 
          data={collectors} 
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onAdvancedView={handleAdvancedView}
          tableName="collectors"
        />
      </div>

      <CollectorDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        collector={editingCollector || undefined}
        onSave={handleSaveCollector}
      />
    </>
  );
}