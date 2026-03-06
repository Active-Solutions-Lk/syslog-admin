"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { getProjects } from "@/app/actions/project";

interface Device {
    id?: string;
    project_id: string;
    device_key: string;
    log_duration: number;
    package_start_at: string | Date;
    package_end_at: string | Date;
}

interface DeviceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    device?: Device;
    onSave: (device: Device) => void;
}

export function DeviceDialog({ open, onOpenChange, device, onSave }: DeviceDialogProps) {
    const [projectId, setProjectId] = useState("");
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [deviceKey, setDeviceKey] = useState("");
    const [logDuration, setLogDuration] = useState(30);
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [projects, setProjects] = useState<any[]>([]);

    useEffect(() => {
        async function fetchProjects() {
            const result = await getProjects();
            if (result.success) setProjects(result.projects || []);
        }
        fetchProjects();
    }, []);

    useEffect(() => {
        if (open) {
            if (device) {
                setProjectId(device.project_id);
                setDeviceKey(device.device_key);
                setLogDuration(device.log_duration);
                setStartAt(new Date(device.package_start_at).toISOString().split('T')[0]);
                setEndAt(new Date(device.package_end_at).toISOString().split('T')[0]);
            } else {
                setProjectId("");
                setDeviceKey("");
                setLogDuration(30);
                const today = new Date();
                const nextMonth = new Date();
                nextMonth.setMonth(today.getMonth() + 1);
                setStartAt(today.toISOString().split('T')[0]);
                setEndAt(nextMonth.toISOString().split('T')[0]);
            }
        }
    }, [open, device]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            ...(device?.id && { id: device.id }),
            project_id: projectId,
            device_key: deviceKey,
            log_duration: logDuration,
            package_start_at: startAt,
            package_end_at: endAt,
        });
    };

    const generateKey = () => {
        const chars = '0123456789ABCDEF';
        let key = '';
        for (let i = 0; i < 32; i++) {
            key += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setDeviceKey(key);
    };

    const selectedProject = projects.find(p => p.id === projectId);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{device ? "Edit Device" : "Create Device Key"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Project</Label>
                            <div className="col-span-3">
                                <Popover open={dropdownOpen} onOpenChange={setDropdownOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={dropdownOpen}
                                            className="w-full justify-between"
                                        >
                                            {projectId
                                                ? projects.find((p) => p.id === projectId)?.end_customer?.company
                                                    ? `${projects.find((p) => p.id === projectId)?.end_customer?.company} (${projects.find((p) => p.id === projectId)?.activation_key})`
                                                    : `Project ${projectId} (${projects.find((p) => p.id === projectId)?.activation_key})`
                                                : "Select project..."}
                                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[300px] p-0">
                                        <Command>
                                            <CommandInput placeholder="Search project..." />
                                            <CommandList>
                                                <CommandEmpty>No project found.</CommandEmpty>
                                                <CommandGroup>
                                                    {projects.map((p) => (
                                                        <CommandItem
                                                            key={p.id}
                                                            value={`${p.end_customer?.company || `Project ${p.id}`} ${p.activation_key}`}
                                                            onSelect={() => {
                                                                setProjectId(p.id === projectId ? "" : p.id);
                                                                setDropdownOpen(false);
                                                            }}
                                                        >
                                                            <Check
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    projectId === p.id ? "opacity-100" : "opacity-0"
                                                                )}
                                                            />
                                                            {p.end_customer?.company || `Project ${p.id}`} ({p.activation_key})
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </CommandList>
                                        </Command>
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Device Key</Label>
                            <div className="col-span-3 flex gap-2">
                                <Input value={deviceKey} readOnly required />
                                <Button type="button" variant="outline" size="sm" onClick={generateKey}>Gen</Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Duration (Days)</Label>
                            <Input
                                type="number"
                                value={logDuration}
                                onChange={(e) => setLogDuration(parseInt(e.target.value))}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Starts</Label>
                            <Input
                                type="date"
                                value={startAt}
                                onChange={(e) => setStartAt(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Ends</Label>
                            <Input
                                type="date"
                                value={endAt}
                                onChange={(e) => setEndAt(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">{device ? "Save Changes" : "Create Key"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
