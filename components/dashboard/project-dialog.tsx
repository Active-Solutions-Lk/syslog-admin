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
import { Switch } from "@/components/ui/switch"; // Add this import
import { ComboBox } from "@/components/dashboard/combo_box";
import { useState, useEffect } from "react";
import {
  getPackages,
  getAvailablePorts,
  getPortById,
  getProjectTypes,
} from "@/app/actions/project";
import { getAdmins } from "@/app/actions/admin";
import { getResellers } from "@/app/actions/reseller";
import { getEndCustomers } from "@/app/actions/end-customer";
import { getCollectors } from "@/app/actions/collectors"; // Add this import

// Function to generate a unique activation key in format AB12-CD34-EF58
const generateActivationKey = () => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const segments = 3;
  const segmentLength = 4;
  const segmentsArray = [];

  for (let i = 0; i < segments; i++) {
    let segment = "";
    for (let j = 0; j < segmentLength; j++) {
      segment += characters.charAt(
        Math.floor(Math.random() * characters.length)
      );
    }
    segmentsArray.push(segment);
  }

  return segmentsArray.join("-");
};

interface Project {
  id?: string;
  activation_key?: string;
  secret_key?: string; // Secret key is only used on the backend
  collector_ip: string | null; // This will now be the collector ID
  logger_ip: string | null;
  pkg_id: string;
  admin_id?: string | null;
  reseller_id?: string | null;
  port_id?: string | null;
  end_customer_id?: string | null;
  type?: string;
  status?: boolean;
  created_at?: Date;
  updated_at?: Date;
  admins?: {
    name: string | null;
    email: string;
  } | null;
  reseller?: {
    company_name: string;
  } | null;
  end_customer?: {
    company: string | null;
  } | null;
  packages?: {
    name: string;
  } | null;
  collector?: {
    // Add collector field
    name: string | null;
  } | null;
}

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  onSave: (project: Project) => void;
}

export function ProjectDialog({
  open,
  onOpenChange,
  project,
  onSave,
}: ProjectDialogProps) {
  const [collector_ip, setCollectorIp] = useState<string | null>(null); // Change to string | null
  const [logger_ip, setLoggerIp] = useState("");
  const [pkg_id, setPkgId] = useState("");
  const [admin_id, setAdminId] = useState<string | null>(null);
  const [reseller_id, setResellerId] = useState<string | null>(null);
  const [port_id, setPortId] = useState<string | null>(null);
  const [end_customer_id, setEndCustomerId] = useState<string | null>(null);
  const [type, setType] = useState<string>("");
  const [status, setStatus] = useState<boolean>(true); // Default to enabled
  const [activation_key, setActivationKey] = useState("");
  const [packages, setPackages] = useState<{ value: string; label: string }[]>(
    []
  );
  const [admins, setAdmins] = useState<{ value: string; label: string }[]>([]);
  const [resellers, setResellers] = useState<
    { value: string; label: string }[]
  >([]);
  const [endCustomers, setEndCustomers] = useState<
    { value: string; label: string }[]
  >([]);
  const [projectTypes, setProjectTypes] = useState<
    { value: string; label: string }[]
  >([]);
  const [collectors, setCollectors] = useState<
    { value: string; label: string }[]
  >([]); // Add collectors state
  const [availablePorts, setAvailablePorts] = useState<
    { value: string; label: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  // Reset form when dialog opens or project changes
  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        setLoading(true);
        try {
          // Fetch packages
          const packagesResult = await getPackages();
          if (packagesResult.success && packagesResult.packages) {
            const packageOptions = packagesResult.packages.map((pkg) => ({
              value: pkg.id,
              label: pkg.name,
            }));
            setPackages(packageOptions);
          }

          // Fetch admins
          const adminsResult = await getAdmins();
          if (adminsResult.success && adminsResult.admins) {
            const adminOptions = adminsResult.admins.map((admin) => ({
              value: admin.id,
              label: admin.name || admin.email,
            }));
            setAdmins(adminOptions);
          }

          // Fetch resellers
          const resellersResult = await getResellers();
          if (resellersResult.success && resellersResult.resellers) {
            const resellerOptions = resellersResult.resellers.map(
              (reseller) => ({
                value: reseller.customer_id,
                label: reseller.company_name,
              })
            );
            setResellers(resellerOptions);
          }

          // Fetch end customers
          const endCustomersResult = await getEndCustomers();
          if (endCustomersResult.success && endCustomersResult.endCustomers) {
            const endCustomerOptions = endCustomersResult.endCustomers.map(
              (endCustomer) => ({
                value: endCustomer.id,
                label: endCustomer.company || "N/A",
              })
            );
            setEndCustomers(endCustomerOptions);
          }

          // Fetch project types
          const projectTypesResult = await getProjectTypes();
          if (projectTypesResult.success && projectTypesResult.projectTypes) {
            const projectTypeOptions = projectTypesResult.projectTypes.map(
              (type) => ({
                value: type.id,
                label: type.name || "N/A",
              })
            );
            setProjectTypes(projectTypeOptions);
          }

          // Fetch collectors
          const collectorsResult = await getCollectors();
          if (collectorsResult.success && collectorsResult.collectors) {
            const collectorOptions = collectorsResult.collectors.map(
              (collector) => ({
                value: collector.id,
                label: collector.name || collector.ip || "N/A",
              })
            );
            setCollectors(collectorOptions);
          }

          if (project) {
            setCollectorIp(project.collector_ip || null); // Set collector ID
            setLoggerIp(project.logger_ip || "");
            setPkgId(project.pkg_id || "");
            setAdminId(project.admin_id || null);
            setResellerId(project.reseller_id || null);
            setPortId(project.port_id || null);
            setEndCustomerId(project.end_customer_id || null);
            setType(project.type || "");
            setStatus(project.status !== undefined ? project.status : true);
            setActivationKey(project.activation_key || "");

            // Fetch available ports for the project's collector IP
            if (project.collector_ip) {
              await fetchAvailablePortsForCollector(
                project.collector_ip,
                project.port_id || null
              );
            }
          } else {
            setCollectorIp(null); // Reset collector ID
            setLoggerIp("");
            setPkgId("");
            setAdminId(null);
            setResellerId(null);
            setPortId(null);
            setEndCustomerId(null);
            setType("");
            setStatus(true); // Default to enabled for new projects
            // Generate a new activation key for new projects
            const newActivationKey = generateActivationKey();
            setActivationKey(newActivationKey);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [open, project]);

  // Fetch available ports when collector IP changes
  useEffect(() => {
    const fetchPorts = async () => {
      // Only fetch ports if we're not editing a project (in which case ports are fetched in fetchData)
      if (open && collector_ip && !project) {
        console.log("Fetching ports for collector:", collector_ip);
        await fetchAvailablePortsForCollector(collector_ip, null);
      } else if (open && !collector_ip) {
        console.log("Clearing available ports");
        setAvailablePorts([]);
      } else {
        console.log("Not fetching ports - open:", open, "collector_ip:", collector_ip, "project:", project);
      }
    };
    
    fetchPorts();
  }, [open, collector_ip, project]);

  // Helper function to fetch available ports
  const fetchAvailablePortsForCollector = async (
    collectorId: string,
    projectId: string | null
  ) => {
    try {
      console.log(
        "Fetching available ports for collector:",
        collectorId,
        "project ID:",
        projectId
      );
      
      // Validate collectorId
      if (!collectorId) {
        console.log("No collector ID provided, clearing available ports");
        setAvailablePorts([]);
        return;
      }
      
      const portsResult = await getAvailablePorts(collectorId);
      console.log("Ports result:", portsResult);
      let portOptions: { value: string; label: string }[] = [];

      if (portsResult.success && portsResult.ports) {
        portOptions = portsResult.ports.map((port) => ({
          value: port.id,
          label: `Port ${port.port}`,
        }));
        console.log("Mapped port options:", portOptions);
      }

      // If we're editing a project and it has a port assigned that's not in the available list,
      // add it to the list so it can be selected
      if (projectId) {
        const isPortInList = portOptions.some(
          (option) => option.value === projectId
        );
        console.log(
          "Port ID in list:",
          isPortInList,
          "Port options:",
          portOptions
        );
        if (!isPortInList) {
          // Get the port details to add it to the list
          const portResult = await getPortById(projectId);
          console.log("Port result:", portResult);
          if (portResult.success && portResult.port) {
            const assignedPortOption = {
              value: portResult.port.id,
              label: `Port ${portResult.port.port} (currently assigned)`,
            };
            portOptions = [assignedPortOption, ...portOptions];
          }
        }
      }

      console.log("Setting available ports:", portOptions);
      setAvailablePorts(portOptions);
      
      // Show a message if this is a non-default collector with restrictions
      if (portsResult.success && portsResult.isDefaultCollector === false) {
        console.log("This is a non-default collector with port restrictions");
      }
    } catch (error) {
      console.error("Error fetching available ports:", error);
      setAvailablePorts([]);
    }
  };

  console.log("loading", loading);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const projectData: Project = {
      collector_ip, // This is now the collector ID
      logger_ip: logger_ip || null,
      pkg_id,
      admin_id,
      reseller_id,
      port_id,
      end_customer_id,
      type,
      status,
      activation_key: activation_key || undefined,
      // secret_key is intentionally not included as it's only managed on the backend
    };

    if (project?.id) {
      projectData.id = project.id;
    }

    onSave(projectData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {project ? "Edit Project" : "Add Project"}
            </DialogTitle>
            <DialogDescription>
              {project
                ? "Make changes to the project here."
                : "Add a new project here."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Combined row for Act Key and Project Type */}
            <div className="grid grid-cols-8 items-center gap-4">
              <Label htmlFor="activation_key" className="text-right col-span-1">
                Act Key
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input
                  id="activation_key"
                  value={activation_key}
                  onChange={(e) => setActivationKey(e.target.value)}
                  className="flex-1"
                />
                {!project && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setActivationKey(generateActivationKey())}
                    size="sm"
                  >
                    Gen
                  </Button>
                )}
              </div>
              <Label htmlFor="type" className="text-right col-span-1">
                Project Type
              </Label>
              <div className="col-span-3">
                <ComboBox
                  options={projectTypes}
                  value={type}
                  onValueChange={setType}
                  placeholder="Select type..."
                  searchPlaceholder="Search types..."
                  emptyMessage="No types found."
                />
              </div>
            </div>
            
            {/* Combined row for Collector and Logger IP */}
            <div className="grid grid-cols-8 items-center gap-4">
              <Label htmlFor="collector" className="text-right col-span-1">
                Collector
              </Label>
              <div className="col-span-3">
                <ComboBox
                  options={collectors}
                  value={collector_ip || ""}
                  onValueChange={(value: string) =>
                    setCollectorIp(value || null)
                  }
                  placeholder="Select collector..."
                  searchPlaceholder="Search collectors..."
                  emptyMessage="No collectors found."
                />
              </div>
              <Label htmlFor="logger_ip" className="text-right col-span-1">
                Logger IP
              </Label>
              <div className="col-span-3">
                <Input
                  id="logger_ip"
                  value={logger_ip}
                  onChange={(e) => setLoggerIp(e.target.value)}
                />
              </div>
            </div>
            
            {/* Combined row for Package and Admin */}
            <div className="grid grid-cols-8 items-center gap-4">
              <Label htmlFor="pkg_id" className="text-right col-span-1">
                Package
              </Label>
              <div className="col-span-3">
                <ComboBox
                  options={packages}
                  value={pkg_id}
                  onValueChange={setPkgId}
                  placeholder="Select package..."
                  searchPlaceholder="Search packages..."
                  emptyMessage="No packages found."
                />
              </div>
              <Label htmlFor="admin_id" className="text-right col-span-1">
                Admin
              </Label>
              <div className="col-span-3">
                <ComboBox
                  options={admins}
                  value={admin_id || ""}
                  onValueChange={(value: string) => setAdminId(value || null)}
                  placeholder="Select admin..."
                  searchPlaceholder="Search admins..."
                  emptyMessage="No admins found."
                />
              </div>
            </div>
            
            {/* Combined row for Reseller and Port */}
            <div className="grid grid-cols-8 items-center gap-4">
              <Label htmlFor="reseller_id" className="text-right col-span-1">
                Reseller
              </Label>
              <div className="col-span-3">
                <ComboBox
                  options={resellers}
                  value={reseller_id || ""}
                  onValueChange={(value: string) =>
                    setResellerId(value || null)
                  }
                  placeholder="Select reseller..."
                  searchPlaceholder="Search resellers..."
                  emptyMessage="No resellers found."
                />
              </div>
              <Label htmlFor="port_id" className="text-right col-span-1">
                Port
              </Label>
              <div className="col-span-3">
                <ComboBox
                  options={availablePorts}
                  value={port_id || ""}
                  onValueChange={(value: string) => setPortId(value || null)}
                  placeholder="Select port..."
                  searchPlaceholder="Search ports..."
                  emptyMessage="No ports found."
                />
              </div>
            </div>
            
            {/* Combined row for End Customer and Status */}
            <div className="grid grid-cols-8 items-center gap-4">
              <Label htmlFor="end_customer_id" className="text-right col-span-1">
                End Cust..
              </Label>
              <div className="col-span-3">
                <ComboBox
                  options={endCustomers}
                  value={end_customer_id || ""}
                  onValueChange={(value: string) =>
                    setEndCustomerId(value || null)
                  }
                  placeholder="Select customer..."
                  searchPlaceholder="Search customers..."
                  emptyMessage="No customers found."
                />
              </div>
              <Label htmlFor="status" className="text-right col-span-1">
                Status
              </Label>
              <div className="col-span-2 flex items-center gap-3">
                <Switch
                  id="status"
                  checked={status}
                  onCheckedChange={setStatus}
                />
                <span className="text-sm">{status ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {project ? "Save Changes" : "Add Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
