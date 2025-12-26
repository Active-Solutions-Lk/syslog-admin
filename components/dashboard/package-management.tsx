"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { PackageDialog } from "@/components/dashboard/package-dialog";
import { PackageAdvancedView } from "@/components/dashboard/package-advanced-view";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getPackages, createPackage, updatePackage, deletePackage } from "@/app/actions/package";
import { CellContext } from "@tanstack/react-table";

// Define types
interface PackageFromServer {
  id: string;
  name: string;
  log_count: number;
  log_duration: string;
  project_duration: string;
  device_count: number;
  created_at?: Date;
  updated_at?: Date;
}

interface Package {
  id?: string;
  name: string;
  log_count: number;
  log_duration: string;
  project_duration: string;
  device_count: number;
  created_at?: Date;
  updated_at?: Date;
}

// Define columns for the data table
const columns = [
  {
    accessorKey: "name",
    header: "Package Name",
    cell: ({ row }: CellContext<Package, unknown>) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${row.original.name}`} />
          <AvatarFallback>{row.original.name?.charAt(0) || 'P'}</AvatarFallback>
        </Avatar>
        <span>{row.original.name || 'N/A'}</span>
      </div>
    ),
  },
  {
    accessorKey: "log_count",
    header: "Log Count",
  },
  {
    accessorKey: "log_duration",
    header: "Log Duration",
  },
  {
    accessorKey: "project_duration",
    header: "Project Duration",
  },
  {
    accessorKey: "device_count",
    header: "Device Count",
  },
  {
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }: CellContext<Package, unknown>) => (
      <span>{row.original.created_at ? new Date(row.original.created_at).toLocaleString() : 'N/A'}</span>
    ),
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ row }: CellContext<Package, unknown>) => (
      <span>{row.original.updated_at ? new Date(row.original.updated_at).toLocaleString() : 'N/A'}</span>
    ),
  },
];

export function PackageManagement() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [isAdvancedViewOpen, setIsAdvancedViewOpen] = useState(false);
  const [viewingPackage, setViewingPackage] = useState<Package | null>(null);

  // Fetch packages from server
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const result = await getPackages();
        if (result.success) {
          setPackages(result.packages || []);
        } else {
          console.error('Failed to fetch packages:', result.error);
        }
      } catch (error) {
        console.error('Error fetching packages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingPackage(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (pkg: Package) => {
    if (!pkg.id) return;
    
    if (window.confirm(`Are you sure you want to delete package ${pkg.name}?`)) {
      try {
        const result = await deletePackage(pkg.id);
        if (result.success) {
          setPackages(packages.filter(p => p.id !== pkg.id));
        } else {
          console.error('Failed to delete package:', result.error);
          alert('Failed to delete package: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting package:', error);
        alert('Error deleting package');
      }
    }
  };

  const handleAdvancedView = (pkg: Package) => {
    setViewingPackage(pkg);
    setIsAdvancedViewOpen(true);
  };

  const handleSavePackage = async (pkg: Package) => {
    try {
      let result: { success: boolean; package?: PackageFromServer; error?: string };
      
      if (pkg.id) {
        // Update existing package
        const { id, name, log_count, log_duration, project_duration, device_count } = pkg;
        result = await updatePackage({ id, name, log_count, log_duration, project_duration, device_count });
        if (result.success) {
          setPackages(packages.map(p => p.id === pkg.id ? result.package! : p));
        }
      } else {
        // Add new package
        const { name, log_count, log_duration, project_duration, device_count } = pkg;
        result = await createPackage({ name, log_count, log_duration, project_duration, device_count });
        if (result.success) {
          setPackages([...packages, result.package!]);
        }
      }
      
      if (result.success) {
        setIsDialogOpen(false);
        setEditingPackage(null);
      } else {
        console.error('Failed to save package:', result.error);
        alert('Failed to save package: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Error saving package');
    }
  };

  if (loading) {
    return <div>Loading packages...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Package Management</h1>
        <Button onClick={handleAdd}>Add Package</Button>
      </div>
      
      <div className="bg-white rounded-lg border-0">
        <DataTable 
          columns={columns} 
          data={packages} 
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onAdvancedView={handleAdvancedView}
          tableName="packages"
        />
      </div>

      <PackageDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        package={editingPackage || undefined}
        onSave={handleSavePackage}
      />
      
      {viewingPackage && (
        <PackageAdvancedView
          open={isAdvancedViewOpen}
          onOpenChange={setIsAdvancedViewOpen}
          package={viewingPackage}
        />
      )}
    </>
  );
}