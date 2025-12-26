"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { AnalyzerDialog } from "@/components/dashboard/analyzer-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { getAnalyzers, createAnalyzer, updateAnalyzer, deleteAnalyzer } from "@/app/actions/analyzers";
import { CellContext } from "@tanstack/react-table";

// Define types
interface AnalyzerFromServer {
  id: string;
  name: string | null;
  ip: string;
  domain: string | null;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

interface Analyzer {
  id?: string;
  name: string;
  ip: string;
  domain: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

// Helper function to convert AnalyzerFromServer to Analyzer
const convertToAnalyzer = (analyzerFromServer: AnalyzerFromServer): Analyzer => {
  return {
    ...analyzerFromServer,
    name: analyzerFromServer.name || '',
    domain: analyzerFromServer.domain || '',
  };
};

// Define columns for the data table
const columns = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }: CellContext<Analyzer, unknown>) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${row.original.name || 'A'}`}/>
          <AvatarFallback>{row.original.name ? row.original.name.charAt(0) : 'A'}</AvatarFallback>
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
    accessorKey: "status",
    header: "Status",
    cell: ({ row }: CellContext<Analyzer, unknown>) => (
      <div className="flex items-center">
        <Switch
          checked={row.original.status === 1}
          disabled
        />
        <span className="ml-2">
          {row.original.status === 1 ? 'Active' : 'Inactive'}
        </span>
      </div>
    ),
  },
];

export function AnalyzerManagement() {
  const [analyzers, setAnalyzers] = useState<Analyzer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAnalyzer, setEditingAnalyzer] = useState<Analyzer | null>(null);

  // Fetch analyzers from server
  useEffect(() => {
    const fetchAnalyzers = async () => {
      try {
        const result = await getAnalyzers();
        if (result.success) {
          const analyzersWithData = (result.analyzers || []).map(convertToAnalyzer);
          setAnalyzers(analyzersWithData);
        } else {
          console.error('Failed to fetch analyzers:', result.error);
        }
      } catch (error) {
        console.error('Error fetching analyzers:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyzers();
  }, []);

  const handleEdit = (analyzer: Analyzer) => {
    setEditingAnalyzer(analyzer);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingAnalyzer(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (analyzer: Analyzer) => {
    if (!analyzer.id) return;
    
    if (window.confirm(`Are you sure you want to delete analyzer ${analyzer.name}?`)) {
      try {
        const result = await deleteAnalyzer(analyzer.id);
        if (result.success) {
          setAnalyzers(analyzers.filter(p => p.id !== analyzer.id));
        } else {
          console.error('Failed to delete analyzer:', result.error);
          alert('Failed to delete analyzer: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting analyzer:', error);
        alert('Error deleting analyzer');
      }
    }
  };

  const handleAdvancedView = (analyzer: Analyzer) => {
    console.log("Advanced view for:", analyzer);
    // In a real app, this would navigate to a detailed view
  };

  const handleSaveAnalyzer = async (analyzer: Analyzer) => {
    try {
      let result: { success: boolean; analyzer?: AnalyzerFromServer; error?: string };
      
      if (analyzer.id) {
        // Update existing analyzer
        const { id, name, ip, domain, status } = analyzer;
        result = await updateAnalyzer({ id, name, ip, domain, status });
        if (result.success) {
          const updatedAnalyzer = convertToAnalyzer(result.analyzer!);
          setAnalyzers(analyzers.map(p => p.id === analyzer.id ? updatedAnalyzer : p));
        }
      } else {
        // Add new analyzer
        const { name, ip, domain, status } = analyzer;
        result = await createAnalyzer({ name, ip, domain, status });
        if (result.success) {
          const newAnalyzer = convertToAnalyzer(result.analyzer!);
          setAnalyzers([...analyzers, newAnalyzer]);
        }
      }
      
      if (result.success) {
        setIsDialogOpen(false);
        setEditingAnalyzer(null);
      } else {
        console.error('Failed to save analyzer:', result.error);
        alert('Failed to save analyzer: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving analyzer:', error);
      alert('Error saving analyzer');
    }
  };

  if (loading) {
    return <div>Loading analyzers...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analyzer Management</h1>
        {/* <Button onClick={handleAdd}>Add Analyzer</Button> */}
      </div>
      
      <div className="bg-white rounded-lg border-0">
        <DataTable 
          columns={columns} 
          data={analyzers} 
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onAdvancedView={handleAdvancedView}
          tableName="analyzers"
        />
      </div>

      <AnalyzerDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        analyzer={editingAnalyzer || undefined}
        onSave={handleSaveAnalyzer}
      />
    </>
  );
}