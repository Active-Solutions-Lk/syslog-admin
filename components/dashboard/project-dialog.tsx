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
import { ComboBox } from "@/components/dashboard/combo_box";
import { useState, useEffect } from "react";
import { getProjectTypes } from "@/app/actions/project";
import { getAdmins } from "@/app/actions/admin";
import { getResellers } from "@/app/actions/reseller";
import { getEndCustomers } from "@/app/actions/end-customer";
import { getCollectors } from "@/app/actions/collectors";
import { getAnalyzers } from "@/app/actions/analyzers";
import { getPorts } from "@/app/actions/ports";
import { getDevicesByProjectId, createDevice, deleteDevice } from "@/app/actions/devices";
import { format } from "date-fns";
import { Copy, Trash } from "lucide-react";

// sort options alphabetically
const sortOptions = (arr: { value: string; label: string }[]) =>
  arr.sort((a, b) =>
    a.label.localeCompare(b.label, undefined, { sensitivity: "base" })
  );

const generateActivationKey = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const gen = () => Array.from({ length: 4 }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join("");
  return `${gen()}-${gen()}-${gen()}`;
};

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: any;
  onSave: (data: any) => void;
}

export function ProjectDialog({ open, onOpenChange, project, onSave }: ProjectDialogProps) {
  const [activation_key, setActivationKey] = useState("");
  const [project_type_id, setProjectTypeId] = useState("");
  const [collector_id, setCollectorId] = useState("");
  const [analyzer_id, setAnalyzerId] = useState("");
  const [port_id, setPortId] = useState("");
  const [admin_id, setAdminId] = useState("");
  const [reseller_id, setResellerId] = useState("");
  const [end_customer_id, setEndCustomerId] = useState("");
  const [device_count, setDeviceCount] = useState("5");
  const [devices, setDevices] = useState<any[]>([]);
  const [localDevices, setLocalDevices] = useState<any[]>([]); // New state for creating devices
  const [newDeviceLoading, setNewDeviceLoading] = useState(false);

  // ... existing options state ...
  const [options, setOptions] = useState<any>({
    types: [], admins: [], resellers: [], customers: [], collectors: [], analyzers: [], ports: []
  });

  const generateHexKey = () => {
    const chars = '0123456789ABCDEF';
    let key = '';
    for (let i = 0; i < 32; i++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
  };

  // Effect to update localDevices when device_count changes (only for new projects)
  useEffect(() => {
    if (!project?.id && open) {
      const count = parseInt(device_count) || 0;
      setLocalDevices(prev => {
        if (prev.length === count) return prev;

        const newDevices = [...prev];
        if (count > prev.length) {
          // Add rows
          for (let i = prev.length; i < count; i++) {
            const today = new Date();
            const nextMonth = new Date();
            nextMonth.setMonth(today.getMonth() + 1);
            newDevices.push({
              device_key: generateHexKey(),
              log_duration: 30,
              package_start_at: today.toISOString().split('T')[0],
              package_end_at: nextMonth.toISOString().split('T')[0]
            });
          }
        } else {
          // Remove rows from the end
          newDevices.splice(count);
        }
        return newDevices;
      });
    }
  }, [device_count, open, project]);

  const updateLocalDevice = (index: number, field: string, value: any) => {
    setLocalDevices(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  // ... existing useEffect ... (keep it, but modify initialization)
  useEffect(() => {
    if (open) {
      // ... existing fetch ...
      const fetchData = async () => {
        const [types, admins, resellers, customers, collectors, analyzers, ports] = await Promise.all([
          getProjectTypes(), getAdmins(), getResellers(), getEndCustomers(), getCollectors(), getAnalyzers(), getPorts()
        ]);
        setOptions({
          types: sortOptions((types.projectTypes || []).map((t: any) => ({ value: t.id, label: t.type }))),
          admins: sortOptions((admins.admins || []).map((a: any) => ({ value: a.id, label: a.username }))),
          resellers: sortOptions((resellers.resellers || []).map((r: any) => ({ value: r.id, label: r.company }))),
          customers: sortOptions((customers.customers || []).map((c: any) => ({
            value: c.id,
            label: c.company || c.contact_person
          }))),
          collectors: sortOptions((collectors.collectors || []).map((c: any) => ({ value: c.id, label: c.name }))),
          analyzers: sortOptions((analyzers.analyzers || []).map((a: any) => ({ value: a.id, label: a.name }))),
          ports: (ports.ports || [])
            .sort((a: any, b: any) => a.port - b.port)
            .map((p: any) => ({
              value: p.id,
              label: `Port ${p.port}`
            })),
          });

        if (project) {
          if (project.id) fetchDevices(project.id);
          // set project data
          setActivationKey(project.activation_key);
          setProjectTypeId(project.project_type_id?.toString() || "");
          setCollectorId(project.collector_id?.toString() || "");
          setAnalyzerId(project.analyzer_id?.toString() || "");
          setPortId(project.port_id?.toString() || "");
          setAdminId(project.admin_id?.toString() || "");
          setResellerId(project.reseller_id?.toString() || "");
          setEndCustomerId(project.end_customer_id?.toString() || "");
          setDeviceCount(project.device_count?.toString() || "5");
          setLocalDevices([]); // Reset local devices for edit mode
        } else {
          setActivationKey(generateActivationKey());
          setProjectTypeId(""); setCollectorId(""); setAnalyzerId(""); setPortId(""); setAdminId(""); setResellerId(""); setEndCustomerId(""); setDeviceCount("5");
          setDevices([]);
          // Initial population for localDevices handled by the other useEffect
        }
      };
      fetchData();
    }
  }, [open, project]);

  // ... existing fetchDevices ...
  const fetchDevices = async (projectId: string) => {
    const result = await getDevicesByProjectId(projectId);
    if (result.success) setDevices(result.devices || []);
  };

  // ... existing handlers ... (keep add/delete for Edit mode if desired)
  const handleAddDevice = async () => {
    if (!project?.id) return; // Only for edit mode

    const limit = parseInt(device_count) || 0;
    const currentCount = devices.length;
    const keysToGenerate = limit - currentCount;

    if (keysToGenerate <= 0) {
      alert(`Cannot generate more keys. The limit of ${limit} devices has been reached.`);
      return;
    }

    setNewDeviceLoading(true);
    try {
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(today.getMonth() + 1);

      // Generate all needed keys sequentially
      for (let i = 0; i < keysToGenerate; i++) {
        await createDevice({
          project_id: project.id,
          log_duration: 30,
          package_start_at: today.toISOString().split('T')[0],
          package_end_at: nextMonth.toISOString().split('T')[0]
        });
      }

      await fetchDevices(project.id);
    } catch (error) {
      console.error("Failed to add device", error);
    } finally {
      setNewDeviceLoading(false);
    }
  };

  const handleDeleteDevice = async (id: string) => {
    if (!confirm("Are you sure you want to delete this device key?")) return;
    await deleteDevice(id);
    if (project?.id) fetchDevices(project.id);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      projectData: {
        activation_key,
        project_type_id,
        collector_id,
        analyzer_id: analyzer_id || null,
        port_id: port_id || null,
        admin_id,
        reseller_id: reseller_id || null,
        end_customer_id: end_customer_id || null,
        device_count: parseInt(device_count) || 5
      },
      localDevices: !project?.id ? localDevices : [] // Only pass localDevices for new projects
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1000px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          {/* ... existing header ... */}
          {/* ... existing form fields ... */}
          <DialogHeader>
            <DialogTitle>{project ? "Edit Project" : "Add Project"}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label>Activation Key</Label>
              <div className="flex gap-2">
                {/* Activation key should be read only */}
                <Input value={activation_key} readOnly required />
                {/* <Input value={activation_key} onChange={(e) => setActivationKey(e.target.value)} required /> */}
                {!project && <Button type="button" variant="outline" onClick={() => setActivationKey(generateActivationKey())}>Gen</Button>}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Project Type</Label>
              <ComboBox options={options.types} value={project_type_id} onValueChange={setProjectTypeId} placeholder="Select type" />
            </div>
            <div className="space-y-2">
              <Label>Collector</Label>
              <ComboBox options={options.collectors} value={collector_id} onValueChange={setCollectorId} placeholder="Select collector" />
            </div>
            <div className="space-y-2">
              <Label>Analyzer</Label>
              <ComboBox options={options.analyzers} value={analyzer_id} onValueChange={setAnalyzerId} placeholder="Select analyzer" />
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <ComboBox options={options.ports} value={port_id} onValueChange={setPortId} placeholder="Select port" />
            </div>
            <div className="space-y-2">
              <Label>Admin</Label>
              <ComboBox options={options.admins} value={admin_id} onValueChange={setAdminId} placeholder="Select admin" />
            </div>
            <div className="space-y-2">
              <Label>Reseller</Label>
              <ComboBox options={options.resellers} value={reseller_id} onValueChange={setResellerId} placeholder="Select reseller" />
            </div>
            <div className="space-y-2">
              <Label>End Customer</Label>
              <ComboBox options={options.customers} value={end_customer_id} onValueChange={setEndCustomerId} placeholder="Select customer" />
            </div>
            <div className="space-y-2">
              <Label>Device Count</Label>
              <Input type="number" value={device_count} onChange={(e) => setDeviceCount(e.target.value)} required />
            </div>
          </div>

          <div className="mt-8 border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Device Keys</h3>
              {project?.id && (
                <Button type="button" size="sm" onClick={handleAddDevice} disabled={newDeviceLoading || devices.length >= (parseInt(device_count) || 0)}>
                  {(() => {
                    const remaining = (parseInt(device_count) || 0) - devices.length;
                    if (newDeviceLoading) return "Generating...";
                    if (remaining <= 0) return "Limit Reached";
                    return `Generate ${remaining} Key${remaining > 1 ? 's' : ''}`;
                  })()}
                </Button>
              )}
            </div>

            <div className="border rounded-md">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground">
                  <tr>
                    <th className="p-2">Device Key</th>
                    <th className="p-2 w-24">Duration</th>
                    <th className="p-2 w-40">Starts</th>
                    <th className="p-2 w-40">Ends</th>
                    <th className="p-2 text-right w-20">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Render existing devices for Edit mode */}
                  {project?.id && devices.map((device) => (
                    <tr key={device.id} className="border-t">
                      <td className="p-2 font-mono flex items-center gap-2">
                        {device.device_key}
                        <Button type="button" variant="ghost" size="icon" className="h-4 w-4" onClick={() => navigator.clipboard.writeText(device.device_key)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </td>
                      <td className="p-2">{device.log_duration}</td>
                      <td className="p-2">{format(new Date(device.package_start_at), "yyyy-MM-dd")}</td>
                      <td className="p-2">{format(new Date(device.package_end_at), "yyyy-MM-dd")}</td>
                      <td className="p-2 text-right">
                        <Button type="button" variant="ghost" size="icon" className="h-6 w-6 text-destructive" onClick={() => handleDeleteDevice(device.id)}>
                          <Trash className="h-3 w-3" />
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {/* Render local devices for Create mode */}
                  {!project?.id && localDevices.map((device, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2">
                        <div className="flex gap-1">
                          <Input
                            value={device.device_key}
                            onChange={(e) => updateLocalDevice(index, 'device_key', e.target.value)}
                            className="h-8 font-mono text-xs"
                          />
                          <Button type="button" variant="outline" size="icon" className="h-8 w-8" onClick={() => updateLocalDevice(index, 'device_key', generateHexKey())}>
                            <Copy className="h-3 w-3 rotate-90" />
                          </Button>
                        </div>
                      </td>
                      <td className="p-2">
                        <Input
                          type="number"
                          value={device.log_duration}
                          onChange={(e) => updateLocalDevice(index, 'log_duration', parseInt(e.target.value))}
                          className="h-8"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="date"
                          value={device.package_start_at}
                          onChange={(e) => updateLocalDevice(index, 'package_start_at', e.target.value)}
                          className="h-8"
                        />
                      </td>
                      <td className="p-2">
                        <Input
                          type="date"
                          value={device.package_end_at}
                          onChange={(e) => updateLocalDevice(index, 'package_end_at', e.target.value)}
                          className="h-8"
                        />
                      </td>
                      <td className="p-2 text-right">
                        {/* Actions for local devices if needed, maybe simple X to clear? */}
                      </td>
                    </tr>
                  ))}

                  {/* Empty states */}
                  {project?.id && devices.length === 0 && (
                    <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">No device keys generated</td></tr>
                  )}
                  {!project?.id && localDevices.length === 0 && (
                    <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Set device count to generate keys</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit">{project ? "Save Changes" : "Add Project"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
