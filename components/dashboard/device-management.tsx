"use client";

import { DataTable } from "@/components/dashboard/data_table";
import { DeviceDialog } from "@/components/dashboard/device-dialog";
import { useState, useEffect } from "react";
import { getDevices, createDevice, updateDevice, deleteDevice } from "@/app/actions/devices";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface Device {
    id?: string;
    project_id: string;
    device_key: string;
    log_duration: number;
    package_start_at: string | Date;
    package_end_at: string | Date;
    projects?: {
        activation_key: string;
        end_customer?: {
            company: string;
        } | null;
    } | null;
}

const columns = [
    {
        accessorKey: "projects.end_customer.company",
        header: "End Customer",
        cell: ({ row }: any) => row.original.projects?.end_customer?.company || "N/A"
    },
    {
        accessorKey: "projects.activation_key",
        header: "Project Key",
        cell: ({ row }: any) => (
            <Badge variant="outline">{row.original.projects?.activation_key}</Badge>
        )
    },
    {
        accessorKey: "device_key",
        header: "Device Key",
        cell: ({ row }: any) => (
            <code className="bg-muted px-1 rounded text-xs truncate max-w-[150px] inline-block">
                {row.original.device_key}
            </code>
        )
    },
    {
        accessorKey: "log_duration",
        header: "Days",
        cell: ({ row }: any) => `${row.original.log_duration}d`
    },
    {
        accessorKey: "package_start_at",
        header: "Valid From",
        cell: ({ row }: any) => format(new Date(row.original.package_start_at), "MMM d, yyyy")
    },
    {
        accessorKey: "package_end_at",
        header: "Valid Until",
        cell: ({ row }: any) => {
            const date = new Date(row.original.package_end_at);
            const isExpired = date < new Date();
            return (
                <span className={isExpired ? "text-destructive font-medium" : ""}>
                    {format(date, "MMM d, yyyy")}
                    {isExpired && " (Expired)"}
                </span>
            );
        }
    },
];

export function DeviceManagement() {
    const [devices, setDevices] = useState<Device[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingDevice, setEditingDevice] = useState<Device | null>(null);

    const fetchDevices = async () => {
        setLoading(true);
        try {
            const result = await getDevices();
            if (result.success) setDevices(result.devices || []);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const handleEdit = (d: Device) => {
        setEditingDevice(d);
        setIsDialogOpen(true);
    };

    const handleAdd = () => {
        setEditingDevice(null);
        setIsDialogOpen(true);
    };

    const handleDelete = async (d: Device) => {
        if (!d.id) return;
        if (window.confirm(`Delete device key ${d.device_key.substring(0, 8)}...?`)) {
            const result = await deleteDevice(d.id);
            if (result.success) fetchDevices();
        }
    };

    const handleSave = async (data: Device) => {
        let result;
        if (data.id) {
            result = await updateDevice(data.id, data);
        } else {
            result = await createDevice(data);
        }

        if (result.success) {
            fetchDevices();
            setIsDialogOpen(false);
            setEditingDevice(null);
        } else {
            alert('Error: ' + result.error);
        }
    };

    if (loading) return <div>Loading devices...</div>;

    return (
        <>
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Device Key Management</h1>
            </div>
            <div className="bg-white rounded-lg border-0 mt-4">
                <DataTable
                    columns={columns}
                    data={devices}
                    onEdit={handleEdit}
                    onAdd={handleAdd}
                    onDelete={handleDelete}
                    tableName="devices"
                />
            </div>
            <DeviceDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                device={editingDevice || undefined}
                onSave={handleSave}
            />
        </>
    );
}
