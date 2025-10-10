"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { AdminDialog } from "@/components/dashboard/admin-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import bcrypt from "bcryptjs"; // For password hashing

// Mock data for admins (without passwords for security)
const initialAdmins = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    role: "Super Admin",
    status: "active",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Admin",
    status: "active",
  },
  {
    id: "3",
    name: "Robert Johnson",
    email: "robert@example.com",
    role: "Moderator",
    status: "inactive",
  },
  {
    id: "4",
    name: "Emily Davis",
    email: "emily@example.com",
    role: "Admin",
    status: "active",
  },
  {
    id: "5",
    name: "Michael Wilson",
    email: "michael@example.com",
    role: "Support",
    status: "active",
  },
];

// Define columns for the data table
const columns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${row.original.name}`} />
          <AvatarFallback>{row.original.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <span>{row.original.name}</span>
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
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
        row.original.status === "active" 
          ? "bg-green-100 text-green-800" 
          : "bg-red-100 text-red-800"
      }`}>
        {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
      </div>
    ),
  },
];

export default function AdminsPage() {
  const [admins, setAdmins] = useState(initialAdmins);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  const handleEdit = (admin) => {
    setEditingAdmin(admin);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingAdmin(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (admin) => {
    if (window.confirm(`Are you sure you want to delete ${admin.name}?`)) {
      setAdmins(admins.filter(a => a.id !== admin.id));
    }
  };

  const handleAdvancedView = (admin) => {
    console.log("Advanced view for:", admin);
    // In a real app, this would navigate to a detailed view
  };

  const handleSaveAdmin = async (admin) => {
    // Hash password if provided
    let updatedAdmin = { ...admin };
    if (admin.password) {
      // In a real app, this would be done on the server side
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(admin.password, salt);
      updatedAdmin.passwordHash = hashedPassword;
      delete updatedAdmin.password; // Remove plain text password
    }

    if (admin.id) {
      // Update existing admin
      setAdmins(admins.map(a => a.id === admin.id ? updatedAdmin : a));
    } else {
      // Add new admin
      const newAdmin = {
        ...updatedAdmin,
        id: (admins.length + 1).toString(),
      };
      setAdmins([...admins, newAdmin]);
    }
    setIsDialogOpen(false);
    setEditingAdmin(null);
  };

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Management</h1>
      </div>
      
      <div className="bg-white rounded-lg border">
        <DataTable 
          columns={columns} 
          data={admins} 
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onAdvancedView={handleAdvancedView}
          searchField="name"
          tableName="admins"
        />
      </div>

      <AdminDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        admin={editingAdmin}
        onSave={handleSaveAdmin}
      />
    </div>
  );
}