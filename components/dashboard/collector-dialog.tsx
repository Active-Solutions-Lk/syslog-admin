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
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";

interface Collector {
  id?: string;
  name: string;
  ip: string;
  secret_key: string;
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
}

interface CollectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collector?: Collector;
  onSave: (collector: Collector) => void;
}

export function CollectorDialog({ open, onOpenChange, collector, onSave }: CollectorDialogProps) {
  const [name, setName] = useState<string>("");
  const [ip, setIp] = useState<string>("");
  const [secretKey, setSecretKey] = useState<string>("");
  const [isActive, setIsActive] = useState<boolean>(true);

  // Reset form when dialog opens or collector changes
  useEffect(() => {
    if (open) {
      if (collector) {
        setName(collector.name || "");
        setIp(collector.ip || "");
        setSecretKey(collector.secret_key || "");
        setIsActive(collector.is_active ?? true);
      } else {
        setName("");
        setIp("");
        setSecretKey("");
        setIsActive(true);
      }
    }
  }, [open, collector]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      alert("Please enter a name");
      return;
    }
    
    if (!ip.trim()) {
      alert("Please enter an IP address");
      return;
    }
    
    if (!secretKey.trim()) {
      alert("Please enter a secret key");
      return;
    }
    
    const collectorData: Collector = {
      name: name.trim(),
      ip: ip.trim(),
      secret_key: secretKey.trim(),
      is_active: isActive,
    };
    
    if (collector?.id) {
      collectorData.id = collector.id;
    }
    
    onSave(collectorData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{collector ? "Edit Collector" : "Add Collector"}</DialogTitle>
            <DialogDescription>
              {collector 
                ? "Make changes to the collector here." 
                : "Add a new collector here."}
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
              <Label htmlFor="ip" className="text-right">
                IP Address
              </Label>
              <Input
                id="ip"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                className="col-span-3"
                placeholder="192.168.1.100"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="secretKey" className="text-right">
                Secret Key
              </Label>
              <Input
                id="secretKey"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="isActive" className="text-right">
                Active
              </Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="isActive"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {collector ? "Save Changes" : "Add Collector"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}