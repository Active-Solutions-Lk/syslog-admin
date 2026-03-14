"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { ProjectTypeDialog } from "@/components/dashboard/project-type-dialog";
import { useState, useEffect, useCallback } from "react";

import {
  getProjectTypes,
  createProjectType,
  updateProjectType,
  deleteProjectType,
} from "@/app/actions/project";

interface ProjectType {
  id?: string;
  type: string;
  description?: string | null;
}

const columns = [
  {
    accessorKey: "type",
    header: "Type Name",
  },
  {
    accessorKey: "description",
    header: "Description",
  },
];

export function ProjectTypeManagement() {
  const [types, setTypes] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<ProjectType | null>(null);

  /* ---------------------------
     FETCH DATA
  ----------------------------*/

  const fetchProjectTypes = useCallback(async () => {
    try {
      setLoading(true);

      const result = await getProjectTypes();

      if (result?.success) {
        setTypes(result.projectTypes ?? []);
      } else {
        console.error(result?.error);
      }
    } catch (error) {
      console.error("Error fetching project types:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjectTypes();
  }, [fetchProjectTypes]);

  /* ---------------------------
     HANDLERS
  ----------------------------*/

  const handleEdit = (t: ProjectType) => {
    setEditingType(t);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingType(null);
    setIsDialogOpen(true);
  };

  const handleDelete = async (t: ProjectType) => {
    if (!t.id) return;

    const confirmed = window.confirm(`Delete project type "${t.type}"?`);
    if (!confirmed) return;

    try {
      const result = await deleteProjectType(t.id);

      if (result?.success) {
        setTypes((prev) => prev.filter((x) => x.id !== t.id));
      } else {
        alert(result?.error || "Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Unexpected error occurred.");
    }
  };

  const handleSave = async (data: ProjectType) => {
    try {
      let result;

      if (data.id) {
        result = await updateProjectType({
          id: data.id,
          type: data.type,
          description: data.description || "",
        });
      } else {
        result = await createProjectType({
          type: data.type,
          description: data.description || "",
        });
      }

      if (result?.success) {
        await fetchProjectTypes();

        setIsDialogOpen(false);
        setEditingType(null);
      } else {
        alert(result?.error || "Failed to save project type");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Unexpected error while saving.");
    }
  };

  /* ---------------------------
     LOADING STATE
  ----------------------------*/

  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <p className="text-gray-500">Loading project types...</p>
      </div>
    );
  }

  /* ---------------------------
     UI
  ----------------------------*/

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Project Type Management</h1>
      </div>

      <div className="bg-white rounded-lg border-0">
        <DataTable
          columns={columns}
          data={types}
          onEdit={handleEdit}
          onAdd={handleAdd}
          onDelete={handleDelete}
          tableName="project_types"
        />
      </div>

      <ProjectTypeDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        projectType={
            editingType
            ? {
                ...editingType,
                description: editingType.description ?? "",
                }
            : undefined
        }
        onSave={handleSave}
        />
    </>
  );
}