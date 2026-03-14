"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { EndCustomerDialog } from "@/components/dashboard/end-customer-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import { getEndCustomers, createEndCustomer, updateEndCustomer, deleteEndCustomer } from "@/app/actions/end-customer";
import { CellContext } from "@tanstack/react-table";

interface EndCustomer {
  id?: string;
  company?: string | null;
  address?: string | null;
  contact_person: string;
  tel: string;
  email?: string | null;
  status: boolean;
}

const columns = [
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }: CellContext<EndCustomer, unknown>) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${row.original.company || row.original.contact_person}`} />
          <AvatarFallback>{row.original.company?.charAt(0) || row.original.contact_person?.charAt(0) || 'EC'}</AvatarFallback>
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
    accessorKey: "tel",
    header: "Telephone",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: CellContext<EndCustomer, unknown>) => (
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${row.original.status
        ? "bg-green-100 text-green-800"
        : "bg-red-100 text-red-800"
        }`}>
        {row.original.status ? "Active" : "Inactive"}
      </div>
    ),
  },
];

export function EndCustomerManagement() {
  const [endCustomers, setEndCustomers] = useState<EndCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEndCustomer, setEditingEndCustomer] = useState<EndCustomer | null>(null);

  useEffect(() => {
    const fetchEndCustomers = async () => {
      try {
        const result = await getEndCustomers();
        if (result.success) {
          setEndCustomers((result.customers || []) as any);
        }
      } catch (error) {
        console.error('Error fetching end customers:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchEndCustomers();
  }, []);

  const handleEdit = (endCustomer: EndCustomer) => {
    setEditingEndCustomer(endCustomer);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingEndCustomer(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (endCustomer: EndCustomer) => {
    if (!endCustomer.id) return;
    if (window.confirm(`Are you sure you want to delete ${endCustomer.company || endCustomer.contact_person}?`)) {
      try {
        const result = await deleteEndCustomer(endCustomer.id);
        if (result.success) {
          setEndCustomers(endCustomers.filter(r => r.id !== endCustomer.id));
        } else {
          // Display error if customer is assigned to a project
          alert(result.error);
        }
      } catch (error) {
        console.error('Error deleting end customer:', error);
      }
    }
  };

  const handleSaveEndCustomer = async (endCustomer: EndCustomer) => {
    try {
      let result;
      if (endCustomer.id) {
        const { id, company, address, contact_person, tel, email, status } = endCustomer;
        result = await updateEndCustomer(id, { company, address, contact_person, tel, email, status });
      } else {
        const { company, address, contact_person, tel, email, status } = endCustomer;
        result = await createEndCustomer({ company, address, contact_person, tel, email, status });
      }

      if (result.success) {
        const refreshed = await getEndCustomers();
        if (refreshed.success) setEndCustomers((refreshed.customers || []) as any);
        setIsDialogOpen(false);
        setEditingEndCustomer(null);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving end customer:', error);
    }
  };

  if (loading) return <div>Loading end customers...</div>;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">End Customer Management</h1>
      </div>
      <div className="bg-white rounded-lg border-0 mt-4">
        <DataTable
          columns={columns}
          data={endCustomers}
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
          tableName="end_customers"
        />
      </div>
      <EndCustomerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        endCustomer={editingEndCustomer || undefined}
        onSave={handleSaveEndCustomer}
      />
    </>
  );
}