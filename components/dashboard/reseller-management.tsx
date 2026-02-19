"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { ResellerDialog } from "@/components/dashboard/reseller-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { getResellers, createReseller, updateReseller, deleteReseller } from "@/app/actions/reseller";
import { CellContext } from "@tanstack/react-table";

interface Reseller {
  id?: string;
  company: string;
  address?: string | null;
  contact_person?: string | null;
  tel?: string | null;
  email?: string | null;
  status: boolean;
}

const columns = [
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }: CellContext<Reseller, unknown>) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${row.original.company}`} />
          <AvatarFallback>{row.original.company?.charAt(0) || 'R'}</AvatarFallback>
        </Avatar>
        <span>{row.original.company || 'N/A'}</span>
      </div>
    ),
  },
  {
    accessorKey: "contact_person",
    header: "Contact Person",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "tel",
    header: "Telephone",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: CellContext<Reseller, unknown>) => (
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.status
          ? "bg-green-100 text-green-800"
          : "bg-red-100 text-red-800"
        }`}>
        {row.original.status ? "Active" : "Inactive"}
      </div>
    ),
  },
];

export function ResellerManagement() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);

  useEffect(() => {
    const fetchResellers = async () => {
      try {
        const result = await getResellers();
        if (result.success) {
          setResellers(result.resellers || []);
        }
      } catch (error) {
        console.error('Error fetching resellers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResellers();
  }, []);

  const handleEdit = (reseller: Reseller) => {
    setEditingReseller(reseller);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingReseller(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (reseller: Reseller) => {
    if (!reseller.id) return;
    if (window.confirm(`Are you sure you want to delete reseller ${reseller.company}?`)) {
      try {
        const result = await deleteReseller(reseller.id);
        if (result.success) {
          setResellers(resellers.filter(r => r.id !== reseller.id));
        }
      } catch (error) {
        console.error('Error deleting reseller:', error);
      }
    }
  };

  const handleSaveReseller = async (reseller: Reseller) => {
    try {
      let result;
      if (reseller.id) {
        result = await updateReseller(reseller);
      } else {
        result = await createReseller(reseller);
      }

      if (result.success) {
        if (reseller.id) {
          setResellers(resellers.map(r => r.id === reseller.id ? result.reseller! : r));
        } else {
          setResellers([...resellers, result.reseller!]);
        }
        setIsDialogOpen(false);
        setEditingReseller(null);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving reseller:', error);
    }
  };

  if (loading) return <div>Loading resellers...</div>;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reseller Management</h1>
      </div>
      <div className="bg-white rounded-lg border-0">
        <DataTable
          columns={columns}
          data={resellers}
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
          tableName="resellers"
        />
      </div>
      <ResellerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        reseller={editingReseller || undefined}
        onSave={handleSaveReseller}
      />
    </>
  );
}