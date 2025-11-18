"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { EndCustomerDialog } from "@/components/dashboard/end-customer-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getEndCustomers, createEndCustomer, updateEndCustomer, deleteEndCustomer } from "@/app/actions/end-customer";
import { CellContext } from "@tanstack/react-table";

// Define types
interface EndCustomerFromServer {
  id: string;
  company: string | null;
  address: string | null;
  contact_person: string;
  tel: string;
  email: string | null;
  status: string;
  created_at?: Date;
  updated_at?: Date;
}

interface EndCustomer {
  id?: string;
  company?: string | null;
  address?: string | null;
  contact_person: string;
  tel: string;
  email?: string | null;
  status: string;
  created_at?: Date;
  updated_at?: Date;
}

// Define columns for the data table
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
    cell: ({ row }: CellContext<EndCustomer, unknown>) => (
      <span>{row.original.email || 'N/A'}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];

export function EndCustomerManagement() {
  const [endCustomers, setEndCustomers] = useState<EndCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEndCustomer, setEditingEndCustomer] = useState<EndCustomer | null>(null);

  // Fetch end customers from server
  useEffect(() => {
    const fetchEndCustomers = async () => {
      try {
        const result = await getEndCustomers();
        if (result.success) {
          setEndCustomers(result.endCustomers || []);
        } else {
          console.error('Failed to fetch end customers:', result.error);
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
          console.error('Failed to delete end customer:', result.error);
          alert('Failed to delete end customer: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting end customer:', error);
        alert('Error deleting end customer');
      }
    }
  };

  const handleAdvancedView = (endCustomer: EndCustomer) => {
    console.log("Advanced view for:", endCustomer);
    // In a real app, this would navigate to a detailed view
  };

  const handleSaveEndCustomer = async (endCustomer: EndCustomer) => {
    try {
      let result: { success: boolean; endCustomer?: EndCustomerFromServer; error?: string };
      
      if (endCustomer.id) {
        // Update existing end customer
        const { id, company, address, contact_person, tel, email, status } = endCustomer;
        result = await updateEndCustomer({ id, company, address, contact_person, tel, email, status });
        if (result.success) {
          setEndCustomers(endCustomers.map(r => r.id === endCustomer.id ? result.endCustomer! : r));
        }
      } else {
        // Add new end customer
        const { company, address, contact_person, tel, email, status } = endCustomer;
        result = await createEndCustomer({ company, address, contact_person, tel, email, status });
        if (result.success) {
          setEndCustomers([...endCustomers, result.endCustomer!]);
        }
      }
      
      if (result.success) {
        setIsDialogOpen(false);
        setEditingEndCustomer(null);
      } else {
        console.error('Failed to save end customer:', result.error);
        alert('Failed to save end customer: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving end customer:', error);
      alert('Error saving end customer');
    }
  };

  if (loading) {
    return <div>Loading end customers...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">End Customer Management</h1>
        <Button onClick={handleAdd}>Add End Customer</Button>
      </div>
      
      <div className="bg-white rounded-lg border-0">
        <DataTable 
          columns={columns} 
          data={endCustomers} 
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onAdvancedView={handleAdvancedView}
          tableName="end customers"
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