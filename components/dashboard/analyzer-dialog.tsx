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

interface Analyzer {
  id?: string;
  name: string;
  ip: string | null;
  domain: string | null;
  status: boolean;
}

interface AnalyzerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analyzer?: Analyzer;
  onSave: (analyzer: Analyzer) => void;
}

export function AnalyzerDialog({ open, onOpenChange, analyzer, onSave }: AnalyzerDialogProps) {
  const [name, setName] = useState("");
  const [ip, setIp] = useState("");
  const [domain, setDomain] = useState("");
  const [status, setStatus] = useState(true);

  useEffect(() => {
    if (open) {
      if (analyzer) {
        setName(analyzer.name || "");
        setIp(analyzer.ip || "");
        setDomain(analyzer.domain || "");
        setStatus(analyzer.status ?? true);
      } else {
        setName(""); setIp(""); setDomain(""); setStatus(true);
      }
    }
  }, [open, analyzer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...(analyzer?.id && { id: analyzer.id }),
      name,
      ip: ip || null,
      domain: domain || null,
      status
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{analyzer ? "Edit Analyzer" : "Add Analyzer"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">IP</Label>
              <Input value={ip} onChange={(e) => setIp(e.target.value)} className="col-span-3" required />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Domain</Label>
              <Input value={domain} onChange={(e) => setDomain(e.target.value)} className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Active</Label>
              <div className="col-span-3">
                <Switch checked={status} onCheckedChange={setStatus} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{analyzer ? "Save Changes" : "Add Analyzer"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}