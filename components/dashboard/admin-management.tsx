"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { AdminDialog } from "@/components/dashboard/admin-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from "@/app/actions/admin";
// import bcrypt from "bcryptjs"; // For password hashing
import { CellContext } from "@tanstack/react-table";

// Define types
interface AdminFromServer {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface Admin {
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: string;
  status: "active" | "inactive";
  createdAt?: Date;
  updatedAt?: Date;
}

// Define columns for the data table
const columns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: CellContext<Admin, unknown>) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${row.original.name}`} />
          <AvatarFallback>{row.original.name?.charAt(0) || 'A'}</AvatarFallback>
        </Avatar>
        <span>{row.original.name || 'N/A'}</span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }: CellContext<Admin, unknown>) => (
      <span>{row.original.role || 'N/A'}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: CellContext<Admin, unknown>) => (
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
        row.original.status === "active" 
          ? "bg-green-100 text-green-800" 
          : "bg-red-100 text-red-800"
      }`}>
        {row.original.status?.charAt(0).toUpperCase() + row.original.status?.slice(1)}
      </div>
    ),
  },
];

export function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  // Fetch admins from server
  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const result = await getAdmins();
        if (result.success) {
          // Convert server admin data to client admin data
          const convertedAdmins = (result.admins || []).map((admin: AdminFromServer) => ({
            id: admin.id,
            name: admin.name || '',
            email: admin.email,
            role: admin.role || 'Admin',
            status: admin.status as "active" | "inactive",
          }));
          setAdmins(convertedAdmins);
        } else {
          console.error('Failed to fetch admins:', result.error);
        }
      } catch (error) {
        console.error('Error fetching admins:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const handleEdit = (admin: Admin) => {
    setEditingAdmin(admin);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingAdmin(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (admin: Admin) => {
    if (!admin.id) return;
    
    if (window.confirm(`Are you sure you want to delete ${admin.name}?`)) {
      try {
        const result = await deleteAdmin(admin.id);
        if (result.success) {
          setAdmins(admins.filter(a => a.id !== admin.id));
        } else {
          console.error('Failed to delete admin:', result.error);
          alert('Failed to delete admin: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting admin:', error);
        alert('Error deleting admin');
      }
    }
  };

  const handleAdvancedView = (admin: Admin) => {
    console.log("Advanced view for:", admin);
    // In a real app, this would navigate to a detailed view
  };

  const handleSaveAdmin = async (admin: Admin) => {
    try {
      let result: { success: boolean; admin?: AdminFromServer; error?: string };
      
      if (admin.id) {
        // Update existing admin (without password)
        const { id, name, email, role, status } = admin;
        result = await updateAdmin({ id, name, email, role, status });
        if (result.success) {
          // Convert server admin data to client admin data
          const convertedAdmin = {
            id: result.admin!.id,
            name: result.admin!.name || '',
            email: result.admin!.email,
            role: result.admin!.role || 'Admin',
            status: result.admin!.status as "active" | "inactive",
          };
          setAdmins(admins.map(a => a.id === admin.id ? convertedAdmin : a));
        }
      } else {
        // Add new admin (with password)
        const { name, email, password, role } = admin;
        result = await createAdmin({ name, email, password, role });
        if (result.success) {
          // Convert server admin data to client admin data
          const convertedAdmin = {
            id: result.admin!.id,
            name: result.admin!.name || '',
            email: result.admin!.email,
            role: result.admin!.role || 'Admin',
            status: result.admin!.status as "active" | "inactive",
          };
          setAdmins([...admins, convertedAdmin]);
        }
      }
      
      if (result.success) {
        setIsDialogOpen(false);
        setEditingAdmin(null);
      } else {
        console.error('Failed to save admin:', result.error);
        alert('Failed to save admin: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving admin:', error);
      alert('Error saving admin');
    }
  };

  if (loading) {
    return <div>Loading admins...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Management</h1>
        {/* <Button onClick={handleAdd}>Add Admin</Button> */ }
      </div>
      
      <div className="bg-white rounded-lg border-0">
        <DataTable 
          columns={columns} 
          data={admins} 
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onAdvancedView={handleAdvancedView}
          tableName="admins"
        />
      </div>

      <AdminDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        admin={editingAdmin || undefined}
        onSave={handleSaveAdmin}
      />
    </>
  );
}