"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { ProjectDialog } from "@/components/dashboard/project-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { getProjects, createProject, updateProject, deleteProject } from "@/app/actions/project";
import { CellContext } from "@tanstack/react-table";

// Define types
interface ProjectFromServer {
  id: string;
  activation_key: string;
  collector_ip: string;
  loggert_ip: string;
  pkg_id: string;
  admin_id: string | null;
  reseller_id: string | null;
  created_at?: Date;
  updated_at?: Date;
  admins?: {
    name: string | null;
    email: string;
  } | null;
  reseller?: {
    company_name: string;
  } | null;
  packages?: {
    name: string;
  } | null;
}

interface Project {
  id?: string;
  activation_key?: string;
  collector_ip: string;
  loggert_ip: string;
  pkg_id: string;
  admin_id?: string | null;
  reseller_id?: string | null;
  created_at?: Date;
  updated_at?: Date;
  admins?: {
    name: string | null;
    email: string;
  } | null;
  reseller?: {
    company_name: string;
  } | null;
  packages?: {
    name: string;
  } | null;
}

// Define columns for the data table
const columns = [
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
    accessorKey: "collector_ip",
    header: "Collector IP",
  },
  {
    accessorKey: "loggert_ip",
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
    accessorKey: "created_at",
    header: "Created",
    cell: ({ row }: CellContext<Project, unknown>) => (
      <span>{row.original.created_at ? new Date(row.original.created_at).toLocaleString() : 'N/A'}</span>
    ),
  },
  {
    accessorKey: "updated_at",
    header: "Updated",
    cell: ({ row }: CellContext<Project, unknown>) => (
      <span>{row.original.updated_at ? new Date(row.original.updated_at).toLocaleString() : 'N/A'}</span>
    ),
  },
];

export function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

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
    // In a real app, this would navigate to a detailed view
  };

  const handleSaveProject = async (project: Project) => {
    try {
      let result: { success: boolean; project?: ProjectFromServer; error?: string };
      
      if (project.id) {
        // Update existing project
        const { id, activation_key, collector_ip, loggert_ip, pkg_id, admin_id, reseller_id } = project;
        result = await updateProject({ id, activation_key, collector_ip, loggert_ip, pkg_id, admin_id, reseller_id });
        if (result.success) {
          setProjects(projects.map(p => p.id === project.id ? result.project! : p));
        }
      } else {
        // Add new project
        const { collector_ip, loggert_ip, pkg_id, admin_id, reseller_id } = project;
        result = await createProject({ collector_ip, loggert_ip, pkg_id, admin_id, reseller_id });
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
        <Button onClick={handleAdd}>Add Project</Button>
      </div>
      
      <div className="bg-white rounded-lg border-0">
        <DataTable 
          columns={columns} 
          data={projects} 
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
          onAdvancedView={handleAdvancedView}
          searchField="activation_key"
          tableName="projects"
        />
      </div>

      <ProjectDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        project={editingProject || undefined}
        onSave={handleSaveProject}
      />
    </>
  );
}