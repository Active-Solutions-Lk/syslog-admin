"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { ProjectDialog } from "@/components/dashboard/project-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
// import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import React, { useState, useEffect, useMemo } from "react";
import { getProjects, createProject, updateProject, deleteProject, updateProjectStatus } from "@/app/actions/project";
import { CellContext } from "@tanstack/react-table";
import { ApiLogsAdvancedView } from "@/components/dashboard/api-logs-advanced-view";

// Define types
interface ProjectFromServer {
  id: string;
  activation_key: string;
  collector_ip: string | null;
  logger_ip: string | null;
  pkg_id: string;
  admin_id: string | null;
  reseller_id: string | null;
  port_id: string | null;
  end_customer_id: string | null;
  type: string;
  status: boolean;
  created_at?: Date;
  updated_at?: Date;
  admins?: {
    name: string | null;
    email: string;
  } | null;
  collector?: { // Add collector field
    name: string | null;
  } | null;
  reseller?: {
    company_name: string;
  } | null;
  end_customer?: {
    company: string | null;
  } | null;
  packages?: {
    name: string;
  } | null;
  port?: {
    port: number;
  } | null;
  project_type?: {
    name: string | null;
  } | null;
}

interface Project {
  id?: string;
  activation_key?: string;
  collector_ip: string | null;
  logger_ip: string | null;
  pkg_id: string;
  admin_id?: string | null;
  reseller_id?: string | null;
  port_id?: string | null;
  end_customer_id?: string | null;
  type?: string;
  status?: boolean;
  created_at?: Date;
  updated_at?: Date;
  admins?: {
    name: string | null;
    email: string;
  } | null;
  collector?: { // Add collector field
    name: string | null;
  } | null;
  reseller?: {
    company_name: string;
  } | null;
  end_customer?: {
    company: string | null;
  } | null;
  packages?: {
    name: string;
  } | null;
  port?: {
    port: number;
  } | null;
  project_type?: {
    name: string | null;
  } | null;
}

export function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  // Add state for advanced view dialog
  const [isAdvancedViewOpen, setIsAdvancedViewOpen] = useState(false);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  // Fetch projects from server
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const result = await getProjects();
        if (result.success) {
          setProjects(result.projects || []);
        } else {
          console.error('Failed to fetch projects:', result.error);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingProject(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (project: Project) => {
    if (!project.id) return;
    
    if (window.confirm(`Are you sure you want to delete project ${project.activation_key}?`)) {
      try {
        const result = await deleteProject(project.id);
        if (result.success) {
          setProjects(projects.filter(p => p.id !== project.id));
        } else {
          console.error('Failed to delete project:', result.error);
          alert('Failed to delete project: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project');
      }
    }
  };

  const handleAdvancedView = (project: Project) => {
    console.log("Advanced view for:", project);
    // Set the project to view and open the dialog
    setViewingProject(project);
    setIsAdvancedViewOpen(true);
  };

  const handleStatusChange = React.useCallback(async (project: Project, newStatus: boolean) => {
    if (!project.id) return;
    
    try {
      const result = await updateProjectStatus(project.id, newStatus);
      if (result.success) {
        setProjects(projects.map(p => 
          p.id === project.id ? { ...p, status: newStatus } : p
        ));
      } else {
        console.error('Failed to update project status:', result.error);
        alert('Failed to update project status: ' + result.error);
      }
    } catch (error) {
      console.error('Error updating project status:', error);
      alert('Error updating project status');
    }
  }, [projects, setProjects]);

  // Define columns for the data table using useMemo to prevent re-creation on every render
  const columns = useMemo(() => [
    {
      accessorKey: "activation_key",
      header: "Activation Key",
      cell: ({ row }: CellContext<Project, unknown>) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${row.original.activation_key || 'P'}`} />
            <AvatarFallback>{row.original.activation_key?.charAt(0) || 'P'}</AvatarFallback>
          </Avatar>
          <span>{row.original.activation_key || 'N/A'}</span>
        </div>
      ),
    },
    {
      accessorKey: "collector.name", // Change to collector name
      header: "Collector",
      cell: ({ row }: CellContext<Project, unknown>) => (
        <span>{row.original.collector?.name || 'N/A'}</span>
      ),
    },
    {
      accessorKey: "logger_ip",
      header: "Logger IP",
    },
    {
      accessorKey: "packages.name",
      header: "Package",
      cell: ({ row }: CellContext<Project, unknown>) => (
        <span>{row.original.packages?.name || 'N/A'}</span>
      ),
    },
    {
      accessorKey: "admins.name",
      header: "Admin",
      cell: ({ row }: CellContext<Project, unknown>) => (
        <span>{row.original.admins?.name || 'N/A'}</span>
      ),
    },
    {
      accessorKey: "reseller.company_name",
      header: "Reseller",
      cell: ({ row }: CellContext<Project, unknown>) => (
        <span>{row.original.reseller?.company_name || 'N/A'}</span>
      ),
    },
    {
      accessorKey: "end_customer.company",
      header: "End Customer",
      cell: ({ row }: CellContext<Project, unknown>) => (
        <span>{row.original.end_customer?.company || 'N/A'}</span>
      ),
    },
    {
      accessorKey: "port_id",
      header: "Port",
      cell: ({ row }: CellContext<Project, unknown>) => (
        <span>{row.original.port ? `Port ${row.original.port.port}` : 'N/A'}</span>
      ),
    },
    {
      accessorKey: "project_type.name",
      header: "Project Type",
      cell: ({ row }: CellContext<Project, unknown>) => (
        <span>{row.original.project_type?.name || 'N/A'}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }: CellContext<Project, unknown>) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={row.original.status}
            onCheckedChange={(checked: boolean) => handleStatusChange(row.original, checked)}
          />
          <span className="text-sm">
            {row.original.status ? "Enabled" : "Disabled"}
          </span>
        </div>
      ),
    },
  ], [handleStatusChange]);

  const handleSaveProject = async (project: Project) => {
    try {
      let result: { success: boolean; project?: ProjectFromServer; error?: string };
      
      if (project.id) {
        // Update existing project
        const { id, activation_key, collector_ip, logger_ip, pkg_id, admin_id, reseller_id, port_id, end_customer_id, type, status } = project;
        result = await updateProject({ id, activation_key, collector_ip, logger_ip, pkg_id, admin_id, reseller_id, port_id, end_customer_id, type, status });
        if (result.success) {
          setProjects(projects.map(p => p.id === project.id ? result.project! : p));
        }
      } else {
        // Add new project
        const { collector_ip, logger_ip, pkg_id, admin_id, reseller_id, port_id, end_customer_id, type } = project;
        result = await createProject({ collector_ip, logger_ip, pkg_id, admin_id, reseller_id, port_id, end_customer_id, type });
        if (result.success) {
          setProjects([...projects, result.project!]);
        }
      }
      
      if (result.success) {
        setIsDialogOpen(false);
        setEditingProject(null);
      } else {
        console.error('Failed to save project:', result.error);
        alert('Failed to save project: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project');
    }
  };

  if (loading) {
    return <div>Loading projects...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Project Management</h1>
        {/* <Button onClick={handleAdd}>Add Project</Button> */}
      </div>
      
      <div className="bg-white rounded-lg border-0">
        <DataTable 
          columns={columns} 
          data={projects} 
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onAdvancedView={handleAdvancedView}
          tableName="projects"
        />
      </div>

      <ProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        project={editingProject || undefined}
        onSave={handleSaveProject}
      />
      
      {/* Advanced View: reuse API logs advanced dialog by activation key */}
      {viewingProject?.activation_key && (
        <ApiLogsAdvancedView
          open={isAdvancedViewOpen}
          onOpenChange={(open) => {
            setIsAdvancedViewOpen(open);
            if (!open) setViewingProject(null);
          }}
          activationKey={viewingProject.activation_key}
        />
      )}
    </>
  );
}