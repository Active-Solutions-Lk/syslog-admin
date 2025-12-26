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

interface Analyzer {
  id?: string;
  name: string;
  ip: string;
  domain: string;
  status: number;
  created_at?: Date;
  updated_at?: Date;
}

interface AnalyzerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  analyzer?: Analyzer;
  onSave: (analyzer: Analyzer) => void;
}

export function AnalyzerDialog({ open, onOpenChange, analyzer, onSave }: AnalyzerDialogProps) {
  const [name, setName] = useState<string>("");
  const [ip, setIp] = useState<string>("");
  const [domain, setDomain] = useState<string>("");
  const [status, setStatus] = useState<number>(1);

  // Reset form when dialog opens or analyzer changes
  useEffect(() => {
    if (open) {
      if (analyzer) {
        setName(analyzer.name || "");
        setIp(analyzer.ip || "");
        setDomain(analyzer.domain || "");
        setStatus(analyzer.status ?? 1);
      } else {
        setName("");
        setIp("");
        setDomain("");
        setStatus(1);
      }
    }
  }, [open, analyzer]);

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
    
    const analyzerData: Analyzer = {
      name: name.trim(),
      ip: ip.trim(),
      domain: domain.trim(),
      status: status,
    };
    
    if (analyzer?.id) {
      analyzerData.id = analyzer.id;
    }
    
    onSave(analyzerData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{analyzer ? "Edit Analyzer" : "Add Analyzer"}</DialogTitle>
            <DialogDescription>
              {analyzer 
                ? "Make changes to the analyzer here." 
                : "Add a new analyzer here."}
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
              <Label htmlFor="domain" className="text-right">
                Domain
              </Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="col-span-3"
                placeholder="example.com"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">
                Active
              </Label>
              <div className="col-span-3 flex items-center">
                <Switch
                  id="status"
                  checked={status === 1}
                  onCheckedChange={(checked) => setStatus(checked ? 1 : 0)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {analyzer ? "Save Changes" : "Add Analyzer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}