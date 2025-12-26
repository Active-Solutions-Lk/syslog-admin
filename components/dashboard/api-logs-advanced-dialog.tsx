"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ApiLogChart } from "@/components/dashboard/api-log-chart";
import { RamBarChart } from "@/components/dashboard/ram-bar-chart";
import { LogCountRadialChart } from "@/components/dashboard/log-count-radial-chart";
import { DataTable } from "@/components/dashboard/data_table";
import { ColumnDef } from "@tanstack/react-table";

// Types shared by advanced view consumers
export interface ApiLog {
  id: string;
  project_id: string;
  cpu_status: number;
  ram_status: number;
  log_count: number;
  device_count: number;
  last_login_date?: Date;
  description?: string;
  created_at?: Date;
  updated_at?: Date;
  project?: {
    activation_key: string;
  };
}

export interface AreaChartDataPoint {
  timestamp: string;
  value: number;
}

interface ApiLogsAdvancedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activationKey: string;
  cpuData: AreaChartDataPoint[];
  ramData: AreaChartDataPoint[];
  logData: AreaChartDataPoint[];
  deviceData: AreaChartDataPoint[];
  packageInfo: { log_quota?: number } | null;
  apiLogs: ApiLog[];
  logColumns: ColumnDef<ApiLog, unknown>[];
}

export function ApiLogsAdvancedDialog({
  open,
  onOpenChange,
  activationKey,
  cpuData,
  ramData,
  logData,
  deviceData,
  packageInfo,
  apiLogs,
  logColumns,
}: ApiLogsAdvancedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-full max-h-full h-screen w-screen overflow-hidden p-0 flex flex-col sm:max-w-full md:max-w-full lg:max-w-full xl:max-w-full 2xl:max-w-full [&>div]:overflow-y-auto [&>div]:max-h-full"
        style={{ maxHeight: "100vh" }}
      >
        <div className="p-6 border-b flex-shrink-0">
          <DialogHeader>
            <DialogTitle>Advanced View - {activationKey}</DialogTitle>
            <DialogDescription>
              Detailed analytics and logs for this project
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-gray-50 p-0 rounded-lg">
              <ApiLogChart
                title="CPU Usage"
                description="Total CPU utilization over the last 7 days"
                chartData={cpuData.map((point) => ({
                  date: point.timestamp,
                  value: point.value,
                }))}
              />
            </div>

            <div className="bg-gray-50 p-0 rounded-lg">
              <RamBarChart
                title="RAM Usage"
                description="RAM utilization percentage over the last 7 days"
                chartData={ramData.map((point) => ({
                  date: point.timestamp,
                  value: point.value,
                }))}
              />
            </div>

            <div className="bg-gray-50 p-0 rounded-lg">
              <LogCountRadialChart
                title="Log Count"
                description="Used logs vs allocated quota"
                chartData={{
                  used: logData.length > 0 ? logData[logData.length - 1].value : 0,
                  quota: packageInfo?.log_quota || 100,
                  fill: "var(--chart-3)",
                }}
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Device Count</h3>
              <p className="text-2xl font-bold text-orange-500">
                {deviceData.length > 0
                  ? deviceData[deviceData.length - 1].value
                  : 0}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Connected devices
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6 flex-grow overflow-hidden flex flex-col">
          <h3 className="font-semibold mb-2">Detailed Logs</h3>
          <div className="border rounded-lg flex-grow overflow-auto">
            <DataTable
              columns={logColumns}
              data={apiLogs}
              tableName="api-logs-details"
            />
          </div>
        </div>

        <div className="p-6 border-t flex justify-end flex-shrink-0">
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

