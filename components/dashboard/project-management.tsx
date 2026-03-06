"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { ProjectDialog } from "@/components/dashboard/project-dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import React, { useState, useEffect, useMemo } from "react";
import { getProjects, createProject, updateProject, deleteProject } from "@/app/actions/project";
import { createDevice } from "@/app/actions/devices";
import { CellContext } from "@tanstack/react-table";

interface Project {
  id: string;
  activation_key: string;
  device_count: number;
  project_types: { type: string };
  collectors: { name: string };
  admins: { username: string };
  reseller?: { company: string } | null;
  end_customer?: { company: string | null; contact_person: string } | null;
  port?: { port: number } | null;
  analyzers?: { name: string } | null;
}

export function ProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const result = await getProjects();
        if (result.success) {
          setProjects(result.projects || []);
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
        }
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const columns = useMemo(() => [
    {
      accessorKey: "activation_key",
      header: "Activation Key",
      cell: ({ row }: CellContext<Project, unknown>) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{row.original.activation_key?.charAt(0) || 'P'}</AvatarFallback>
          </Avatar>
          <span className="font-medium">{row.original.activation_key}</span>
        </div>
      ),
    },
    {
      header: "Type",
      cell: ({ row }: CellContext<Project, unknown>) => row.original.project_types?.type || 'N/A',
    },
    {
      header: "Collector",
      cell: ({ row }: CellContext<Project, unknown>) => row.original.collectors?.name || 'N/A',
    },
    {
      header: "Analyzer",
      cell: ({ row }: CellContext<Project, unknown>) => row.original.analyzers?.name || 'N/A',
    },
    {
      header: "Port",
      cell: ({ row }: CellContext<Project, unknown>) => row.original.port?.port || 'N/A',
    },
    {
      header: "Customer",
      cell: ({ row }: CellContext<Project, unknown>) => row.original.end_customer?.company || row.original.end_customer?.contact_person || 'N/A',
    },
    {
      accessorKey: "device_count",
      header: "Devices",
    },
    {
      header: "Admin",
      cell: ({ row }: CellContext<Project, unknown>) => row.original.admins?.username || 'N/A',
    },
  ], []);

  const handleSaveProject = async ({ projectData, localDevices }: { projectData: any, localDevices: any[] }) => {
    try {
      let result;
      // Handle legacy format if just projectData is passed directly (fallback)
      const data = projectData || arguments[0];
      const devices = localDevices || [];

      if (editingProject?.id) {
        result = await updateProject({ ...data, id: editingProject.id });
      } else {
        result = await createProject(data);
      }

      if (result.success) {
        // If it's a new project and we have local devices to create
        if (!editingProject?.id && devices.length > 0 && result.project?.id) {
          const projectId = result.project.id;
          // Create all devices sequantially
          for (const device of devices) {
            await createDevice({
              ...device,
              project_id: projectId
            });
          }
        }

        // Refresh list
        const refreshed = await getProjects();
        if (refreshed.success) setProjects(refreshed.projects || []);
        setIsDialogOpen(false);
        setEditingProject(null);
      } else {
        alert('Error: ' + result.error);
      }
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Project Management</h1>
      </div>
      <div className="bg-white rounded-lg border-0 mt-4">
        <DataTable
          columns={columns}
          data={projects}
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
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