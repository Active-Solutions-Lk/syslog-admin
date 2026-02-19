"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { ProjectTypeDialog } from "@/components/dashboard/project-type-dialog";
import { useState, useEffect } from "react";
import { getProjectTypes, createProjectType, updateProjectType, deleteProjectType } from "@/app/actions/project";
import { CellContext } from "@tanstack/react-table";

interface ProjectType {
    id?: string;
    type: string;
}

const columns = [
    {
        accessorKey: "type",
        header: "Type Name",
    },
];

export function ProjectTypeManagement() {
    const [types, setTypes] = useState<ProjectType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingType, setEditingType] = useState<ProjectType | null>(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const result = await getProjectTypes();
                if (result.success) setTypes(result.projectTypes || []);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

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
        if (window.confirm(`Delete project type ${t.type}?`)) {
            const result = await deleteProjectType(t.id);
            if (result.success) setTypes(types.filter(x => x.id !== t.id));
        }
    };

    const handleSave = async (data: ProjectType) => {
        let result;
        if (data.id) {
            result = await updateProjectType({ id: data.id, type: data.type });
        } else {
            result = await createProjectType(data);
        }

        if (result.success) {
            const refreshed = await getProjectTypes();
            if (refreshed.success) setTypes(refreshed.projectTypes || []);
            setIsDialogOpen(false);
            setEditingType(null);
        } else {
            alert('Error: ' + result.error);
        }
    };

    if (loading) return <div>Loading project types...</div>;

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Project Type Management</h1>
            </div>
            <div className="bg-white rounded-lg border-0 mt-4">
                <DataTable columns={columns} data={types} onEdit={handleEdit} onAdd={handleAdd} onDelete={handleDelete} tableName="project_types" />
            </div>
            <ProjectTypeDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} projectType={editingType || undefined} onSave={handleSave} />
        </>
    );
}
