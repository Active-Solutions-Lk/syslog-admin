"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define types
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

interface PackageAdvancedViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  package: Package;
}

export function PackageAdvancedView({ 
  open, 
  onOpenChange,
  package: pkg
}: PackageAdvancedViewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Package Details - {pkg.name}</DialogTitle>
          <DialogDescription>
            Detailed information about the package
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Package Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Package Information</CardTitle>
              <CardDescription>Core details about this package</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Name</h4>
                <p className="text-sm text-muted-foreground">{pkg.name}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">ID</h4>
                <p className="text-sm text-muted-foreground">{pkg.id || 'N/A'}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Log Quota</h4>
                <p className="text-sm text-muted-foreground">{pkg.log_count} logs</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Device Quota</h4>
                <p className="text-sm text-muted-foreground">{pkg.device_count} devices</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Log Duration</h4>
                <p className="text-sm text-muted-foreground">{pkg.log_duration}</p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Project Duration</h4>
                <p className="text-sm text-muted-foreground">{pkg.project_duration}</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Timestamps Card */}
          <Card>
            <CardHeader>
              <CardTitle>Timestamps</CardTitle>
              <CardDescription>Creation and update information</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-medium">Created At</h4>
                <p className="text-sm text-muted-foreground">
                  {pkg.created_at ? new Date(pkg.created_at).toLocaleString() : 'N/A'}
                </p>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Last Updated</h4>
                <p className="text-sm text-muted-foreground">
                  {pkg.updated_at ? new Date(pkg.updated_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>
          
          {/* Quotas Summary Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quotas Summary</CardTitle>
              <CardDescription>Package allocation limits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">{pkg.log_count}</div>
                  <div className="text-sm text-muted-foreground">Log Entries</div>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-green-600">{pkg.device_count}</div>
                  <div className="text-sm text-muted-foreground">Devices</div>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">{pkg.log_duration}</div>
                  <div className="text-sm text-muted-foreground">Retention</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}