"use client";

// Force TypeScript cache refresh

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface Package {
  id?: string;
  name: string;
  log_count: number;
  log_duration: string;
  project_duration: string;
  device_count: number;
  created_at?: Date;
  updated_at?: Date;
}

interface PackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package?: Package;
  onSave: (pkg: Package) => void;
}

export function PackageDialog({ open, onOpenChange, package: pkg, onSave }: PackageDialogProps) {
  const [name, setName] = useState("");
  const [log_count, setLogCount] = useState(0);
  const [log_duration, setLogDuration] = useState("");
  const [project_duration, setProjectDuration] = useState("");
  const [device_count, setDeviceCount] = useState(0);

  // Reset form when dialog opens or package changes
  useEffect(() => {
    if (open) {
      if (pkg) {
        setName(pkg.name || "");
        setLogCount(pkg.log_count || 0);
        setLogDuration(pkg.log_duration || "");
        setProjectDuration(pkg.project_duration || "");
        setDeviceCount(pkg.device_count || 0);
      } else {
        setName("");
        setLogCount(0);
        setLogDuration("");
        setProjectDuration("");
        setDeviceCount(0);
      }
    }
  }, [open, pkg]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const packageData: Package = {
      name,
      log_count,
      log_duration,
      project_duration,
      device_count,
    };
    
    if (pkg?.id) {
      packageData.id = pkg.id;
    }
    
    onSave(packageData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{pkg ? "Edit Package" : "Add Package"}</DialogTitle>
            <DialogDescription>
              {pkg 
                ? "Make changes to the package here." 
                : "Add a new package here."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="log_count" className="text-right">
                Log Count
              </Label>
              <Input
                id="log_count"
                type="number"
                value={log_count}
                onChange={(e) => setLogCount(parseInt(e.target.value) || 0)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="log_duration" className="text-right">
                Log Duration
              </Label>
              <Input
                id="log_duration"
                value={log_duration}
                onChange={(e) => setLogDuration(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="project_duration" className="text-right">
                Project Duration
              </Label>
              <Input
                id="project_duration"
                value={project_duration}
                onChange={(e) => setProjectDuration(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="device_count" className="text-right">
                Device Count
              </Label>
              <Input
                id="device_count"
                type="number"
                value={device_count}
                onChange={(e) => setDeviceCount(parseInt(e.target.value) || 0)}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {pkg ? "Save Changes" : "Add Package"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}