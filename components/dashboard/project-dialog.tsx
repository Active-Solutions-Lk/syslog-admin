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
import { getPackages } from "@/app/actions/project";
import { getAdmins } from "@/app/actions/admin";
import { getResellers } from "@/app/actions/reseller";

// Function to generate a unique activation key in format AB12-CD34-EF58
const generateActivationKey = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const segments = 3;
  const segmentLength = 4;
  const segmentsArray = [];
  
  for (let i = 0; i < segments; i++) {
    let segment = '';
    for (let j = 0; j < segmentLength; j++) {
      segment += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    segmentsArray.push(segment);
  }
  
  return segmentsArray.join('-');
};

interface Project {
  id?: string;
  activation_key?: string;
  collector_ip: string;
  loggert_ip: string;
  pkg_id: string;
  admin_id?: string | null;
  reseller_id?: string | null;
  created_at?: Date;
  updated_at?: Date;
  admins?: {
    name: string | null;
    email: string;
  } | null;
  reseller?: {
    company_name: string;
  } | null;
  packages?: {
    name: string;
  } | null;
}

interface ProjectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
  onSave: (project: Project) => void;
}

export function ProjectDialog({ open, onOpenChange, project, onSave }: ProjectDialogProps) {
  const [collector_ip, setCollectorIp] = useState("");
  const [loggert_ip, setLoggerIp] = useState("");
  const [pkg_id, setPkgId] = useState("");
  const [admin_id, setAdminId] = useState<string | null>(null);
  const [reseller_id, setResellerId] = useState<string | null>(null);
  const [activation_key, setActivationKey] = useState("");
  const [packages, setPackages] = useState<{value: string, label: string}[]>([]);
  const [admins, setAdmins] = useState<{value: string, label: string}[]>([]);
  const [resellers, setResellers] = useState<{value: string, label: string}[]>([]);
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
            const packageOptions = packagesResult.packages.map(pkg => ({
              value: pkg.id,
              label: pkg.name
            }));
            setPackages(packageOptions);
          }
          
          // Fetch admins
          const adminsResult = await getAdmins();
          if (adminsResult.success && adminsResult.admins) {
            const adminOptions = adminsResult.admins.map(admin => ({
              value: admin.id,
              label: admin.name || admin.email
            }));
            setAdmins(adminOptions);
          }
          
          // Fetch resellers
          const resellersResult = await getResellers();
          if (resellersResult.success && resellersResult.resellers) {
            const resellerOptions = resellersResult.resellers.map(reseller => ({
              value: reseller.customer_id,
              label: reseller.company_name
            }));
            setResellers(resellerOptions);
          }
          
          if (project) {
            setCollectorIp(project.collector_ip || "");
            setLoggerIp(project.loggert_ip || "");
            setPkgId(project.pkg_id || "");
            setAdminId(project.admin_id || null);
            setResellerId(project.reseller_id || null);
            setActivationKey(project.activation_key || "");
          } else {
            setCollectorIp("");
            setLoggerIp("");
            setPkgId("");
            setAdminId(null);
            setResellerId(null);
            // Generate a new activation key for new projects
            const newActivationKey = generateActivationKey();
            setActivationKey(newActivationKey);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchData();
    }
  }, [open, project]);

  console.log('loading', loading)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const projectData: Project = {
      collector_ip,
      loggert_ip,
      pkg_id,
      admin_id,
      reseller_id,
      activation_key: activation_key || undefined,
    };
    
    if (project?.id) {
      projectData.id = project.id;
    }
    
    onSave(projectData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{project ? "Edit Project" : "Add Project"}</DialogTitle>
            <DialogDescription>
              {project 
                ? "Make changes to the project here." 
                : "Add a new project here."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="activation_key" className="text-right">
                Activation Key
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
                  >
                    Generate
                  </Button>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="collector_ip" className="text-right">
                Collector IP
              </Label>
              <Input
                id="collector_ip"
                value={collector_ip}
                onChange={(e) => setCollectorIp(e.target.value)}
                className="col-span-3"
                
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="loggert_ip" className="text-right">
                Logger IP
              </Label>
              <Input
                id="loggert_ip"
                value={loggert_ip}
                onChange={(e) => setLoggerIp(e.target.value)}
                className="col-span-3"
                
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pkg_id" className="text-right">
                Package
              </Label>
              <div className="col-span-3">
                <ComboBox
                  options={packages}
                  value={pkg_id}
                  onValueChange={setPkgId}
                  placeholder="Select a package..."
                  searchPlaceholder="Search packages..."
                  emptyMessage="No packages found."
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="admin_id" className="text-right">
                Admin
              </Label>
              <div className="col-span-3">
                <ComboBox
                  options={admins}
                  value={admin_id || ""}
                  onValueChange={(value: string) => setAdminId(value || null)}
                  placeholder="Select an admin..."
                  searchPlaceholder="Search admins..."
                  emptyMessage="No admins found."
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reseller_id" className="text-right">
                Reseller
              </Label>
              <div className="col-span-3">
                <ComboBox
                  options={resellers}
                  value={reseller_id || ""}
                  onValueChange={(value: string) => setResellerId(value || null)}
                  placeholder="Select a reseller..."
                  searchPlaceholder="Search resellers..."
                  emptyMessage="No resellers found."
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
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