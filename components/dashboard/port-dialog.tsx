"use client";

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

interface Port {
  id?: string;
  port: number;
  created_at?: Date;
  updated_at?: Date;
}

interface PortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  port?: Port;
  onSave: (port: Port) => void;
}

export function PortDialog({ open, onOpenChange, port, onSave }: PortDialogProps) {
  const [portNumber, setPortNumber] = useState<number | "">("");

  // Reset form when dialog opens or port changes
  useEffect(() => {
    if (open) {
      if (port) {
        setPortNumber(port.port || "");
      } else {
        setPortNumber("");
      }
    }
  }, [open, port]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (portNumber === "") {
      alert("Please enter a port number");
      return;
    }
    
    const portData: Port = {
      port: Number(portNumber),
    };
    
    if (port?.id) {
      portData.id = port.id;
    }
    
    onSave(portData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{port ? "Edit Port" : "Add Port"}</DialogTitle>
            <DialogDescription>
              {port 
                ? "Make changes to the port here." 
                : "Add a new port here."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="port" className="text-right">
                Port Number
              </Label>
              <Input
                id="port"
                type="number"
                value={portNumber}
                onChange={(e) => setPortNumber(e.target.value === "" ? "" : parseInt(e.target.value))}
                className="col-span-3"
                min="1"
                max="65535"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {port ? "Save Changes" : "Add Port"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}