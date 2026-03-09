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
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";

interface Collector {
  id?: string;
  name: string;
  ip: string | null;
  domain: string | null;
  secret_key: string;
  is_active: boolean;
}

interface CollectorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collector?: Collector;
  onSave: (collector: Collector) => void | Promise<void>;
}

export function CollectorDialog({ open, onOpenChange, collector, onSave }: CollectorDialogProps) {
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [domain, setDomain] = useState("");
  const [secretKey, setSecretKey] = useState("");
  const [is_active, setIsActive] = useState(true);

  useEffect(() => {
    if (open) {
      if (collector) {
        setName(collector.name || "");
        setIp(collector.ip || "");
        setDomain(collector.domain || "");
        setSecretKey(collector.secret_key || "");
        setIsActive(collector.is_active ?? true);
      } else {
        setName(""); setIp(""); setDomain(""); setSecretKey(""); setIsActive(true);
      }
    }
  }, [open, collector]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation for IP address and Secret Key
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ip && !ipRegex.test(ip)) {
      alert("Invalid IP address format. Use format x.x.x.x");
      return;
    }

    if (!secretKey || secretKey.length < 8) {
      alert("Secret Key is required and must be at least 8 characters long.");
      return;
    }

    onSave({
      ...(collector?.id && { id: collector.id }),
      name,
      ip: ip || null,
      domain: domain || null,
      secret_key: secretKey,
      is_active
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{collector ? "Edit Collector" : "Add Collector"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">IP</Label>
              <Input value={ip} onChange={(e) => setIp(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Domain</Label>
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Secret Key</Label>
              <Input value={secretKey} onChange={(e) => setSecretKey(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Active</Label>
              <div className="col-span-3">
                <Switch checked={is_active} onCheckedChange={setIsActive} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{collector ? "Save Changes" : "Add Collector"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}