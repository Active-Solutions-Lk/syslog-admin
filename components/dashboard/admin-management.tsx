"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { AdminDialog } from "@/components/dashboard/admin-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { getAdmins, createAdmin, updateAdmin, deleteAdmin } from "@/app/actions/admin";
import { CellContext } from "@tanstack/react-table";

interface AdminFromServer {
  id: string;
  username: string;
  email: string;
  role: string | null;
  created_at: Date;
}

interface Admin {
  id?: string;
  username: string;
  email: string;
  password?: string;
  role: string;
}

const columns = [
  {
    accessorKey: "username",
    header: "Username",
    cell: ({ row }: CellContext<Admin, unknown>) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${row.original.username}`} />
          <AvatarFallback>{row.original.username?.charAt(0) || 'A'}</AvatarFallback>
        </Avatar>
        <span>{row.original.username || 'N/A'}</span>
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
];

export function AdminManagement() {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const result = await getAdmins();
        if (result.success) {
          const convertedAdmins = (result.admins || []).map((admin: AdminFromServer) => ({
            id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role || 'Admin',
          }));
          setAdmins(convertedAdmins);
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
    if (window.confirm(`Are you sure you want to delete admin ${admin.username}?`)) {
      try {
        const result = await deleteAdmin(admin.id);
        if (result.success) {
          setAdmins(admins.filter(a => a.id !== admin.id));
        } else {
          // Display the error message cleanly so the user knows they cannot delete
          // an admin when they are tied to a project.
          alert(result.error);
        }
      } catch (error) {
        console.error('Error deleting admin:', error);
      }
    }
  };

  const handleSaveAdmin = async (admin: Admin) => {
    try {
      let result;
      if (admin.id) {
        result = await updateAdmin({ id: admin.id, username: admin.username, email: admin.email, role: admin.role });
        if (result.success && result.admin) {
          const updated = {
            id: result.admin.id,
            username: result.admin.username,
            email: result.admin.email,
            role: result.admin.role || 'Admin',
          };
          setAdmins(admins.map(a => a.id === admin.id ? updated : a));
        }
      } else {
        result = await createAdmin({ username: admin.username, email: admin.email, password: admin.password!, role: admin.role });
        if (result.success && result.admin) {
          const created = {
            id: result.admin.id,
            username: result.admin.username,
            email: result.admin.email,
            role: result.admin.role || 'Admin',
          };
          setAdmins([...admins, created]);
        }
      }
      if (result.success) {
        setIsDialogOpen(false);
        setEditingAdmin(null);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving admin:', error);
    }
  };

  if (loading) return <div>Loading admins...</div>;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Management</h1>
      </div>
      <div className="bg-white rounded-lg border-0">
        <DataTable
          columns={columns}
          data={admins}
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
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