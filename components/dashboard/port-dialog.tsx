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

interface Port {
  id?: string;
  port: number;
}

interface PortDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  port?: Port;
  onSave: (port: Port) => void;
}

export function PortDialog({ open, onOpenChange, port, onSave }: PortDialogProps) {
  const [portNumber, setPortNumber] = useState<number | "">("");

  useEffect(() => {
    if (open) {
      setPortNumber(port?.port || "");
    }
  }, [open, port]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (portNumber === "") return;
    onSave({
      ...(port?.id && { id: port.id }),
      port: Number(portNumber)
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{port ? "Edit Port" : "Add Port"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Port</Label>
              <Input
                type="number"
                value={portNumber}
                onChange={(e) => setPortNumber(e.target.value === "" ? "" : parseInt(e.target.value))}
                className="col-span-3"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{port ? "Save" : "Add"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}