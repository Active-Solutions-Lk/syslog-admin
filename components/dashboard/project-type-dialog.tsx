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
import { useState, useEffect } from "react";

interface ProjectType {
    id?: string;
    type: string;
}

interface ProjectTypeDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    projectType?: ProjectType;
    onSave: (type: ProjectType) => void;
}

export function ProjectTypeDialog({ open, onOpenChange, projectType, onSave }: ProjectTypeDialogProps) {
    const [typeName, setTypeName] = useState("");

    useEffect(() => {
        if (open) {
            setTypeName(projectType?.type || "");
        }
    }, [open, projectType]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!typeName.trim()) return;
        onSave({
            ...(projectType?.id && { id: projectType.id }),
            type: typeName.trim()
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{projectType ? "Edit Project Type" : "Add Project Type"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">Type Name</Label>
                            <Input
                                value={typeName}
                                onChange={(e) => setTypeName(e.target.value)}
                                className="col-span-3"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                        <Button type="submit">{projectType ? "Save" : "Add"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
