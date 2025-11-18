"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { ResellerDialog } from "@/components/dashboard/reseller-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getResellers, createReseller, updateReseller, deleteReseller } from "@/app/actions/reseller";
import { CellContext } from "@tanstack/react-table";

// Define types
interface ResellerFromServer {
  customer_id: string;
  company_name: string;
  address: string | null;
  type: string;
  credit_limit: string | null;
  payment_terms: string | null;
  note: string | null;
  vat: string | null;
  city: string | null;
  created_at?: Date;
  updated_at?: Date;
}

interface Reseller {
  customer_id?: string;
  company_name: string;
  address?: string | null;
  type: string;
  credit_limit?: string | null;
  payment_terms?: string | null;
  note?: string | null;
  vat?: string | null;
  city?: string | null;
  created_at?: Date;
  updated_at?: Date;
}

// Define columns for the data table
const columns = [
  {
    accessorKey: "company_name",
    header: "Company Name",
    cell: ({ row }: CellContext<Reseller, unknown>) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${row.original.company_name}`} />
          <AvatarFallback>{row.original.company_name?.charAt(0) || 'R'}</AvatarFallback>
        </Avatar>
        <span>{row.original.company_name || 'N/A'}</span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "credit_limit",
    header: "Credit Limit",
    cell: ({ row }: CellContext<Reseller, unknown>) => (
      <span>{row.original.credit_limit || 'N/A'}</span>
    ),
  },
  {
    accessorKey: "payment_terms",
    header: "Payment Terms",
    cell: ({ row }: CellContext<Reseller, unknown>) => (
      <span>{row.original.payment_terms || 'N/A'}</span>
    ),
  },
  {
    accessorKey: "city",
    header: "City",
    cell: ({ row }: CellContext<Reseller, unknown>) => (
      <span>{row.original.city || 'N/A'}</span>
    ),
  },
];

export function ResellerManagement() {
  const [resellers, setResellers] = useState<Reseller[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReseller, setEditingReseller] = useState<Reseller | null>(null);

  // Fetch resellers from server
  useEffect(() => {
    const fetchResellers = async () => {
      try {
        const result = await getResellers();
        if (result.success) {
          setResellers(result.resellers || []);
        } else {
          console.error('Failed to fetch resellers:', result.error);
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
    if (!reseller.customer_id) return;
    
    if (window.confirm(`Are you sure you want to delete ${reseller.company_name}?`)) {
      try {
        const result = await deleteReseller(reseller.customer_id);
        if (result.success) {
          setResellers(resellers.filter(r => r.customer_id !== reseller.customer_id));
        } else {
          console.error('Failed to delete reseller:', result.error);
          alert('Failed to delete reseller: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting reseller:', error);
        alert('Error deleting reseller');
      }
    }
  };

  const handleAdvancedView = (reseller: Reseller) => {
    console.log("Advanced view for:", reseller);
    // In a real app, this would navigate to a detailed view
  };

  const handleSaveReseller = async (reseller: Reseller) => {
    try {
      let result: { success: boolean; reseller?: ResellerFromServer; error?: string };
      
      if (reseller.customer_id) {
        // Update existing reseller
        const { customer_id, company_name, address, type, credit_limit, payment_terms, note, vat, city } = reseller;
        result = await updateReseller({ customer_id, company_name, address, type, credit_limit, payment_terms, note, vat, city });
        if (result.success) {
          setResellers(resellers.map(r => r.customer_id === reseller.customer_id ? result.reseller! : r));
        }
      } else {
        // Add new reseller
        const { company_name, address, type, credit_limit, payment_terms, note, vat, city } = reseller;
        result = await createReseller({ company_name, address, type, credit_limit, payment_terms, note, vat, city });
        if (result.success) {
          setResellers([...resellers, result.reseller!]);
        }
      }
      
      if (result.success) {
        setIsDialogOpen(false);
        setEditingReseller(null);
      } else {
        console.error('Failed to save reseller:', result.error);
        alert('Failed to save reseller: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving reseller:', error);
      alert('Error saving reseller');
    }
  };

  if (loading) {
    return <div>Loading resellers...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reseller Management</h1>
        <Button onClick={handleAdd}>Add Reseller</Button>
      </div>
      
      <div className="bg-white rounded-lg border-0">
        <DataTable 
          columns={columns} 
          data={resellers} 
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onAdvancedView={handleAdvancedView}
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