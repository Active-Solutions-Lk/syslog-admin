"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { getApiLogsByActivationKey, getProjectPackageInfo } from "@/app/actions/api-logs";
import { CellContext, ColumnDef } from "@tanstack/react-table";
import { ApiLogsAdvancedDialog, ApiLog, AreaChartDataPoint } from "@/components/dashboard/api-logs-advanced-dialog";

interface ApiLogsAdvancedViewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activationKey: string;
}

export function ApiLogsAdvancedView({ open, onOpenChange, activationKey }: ApiLogsAdvancedViewProps) {
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [cpuData, setCpuData] = useState<AreaChartDataPoint[]>([]);
  const [ramData, setRamData] = useState<AreaChartDataPoint[]>([]);
  const [logData, setLogData] = useState<AreaChartDataPoint[]>([]);
  const [deviceData, setDeviceData] = useState<AreaChartDataPoint[]>([]);
  const [packageInfo, setPackageInfo] = useState<any>(null);

  // Fetch API logs for the selected activation key
  useEffect(() => {
    if (open && activationKey) {
      const fetchApiLogs = async () => {
        try {
          setLoading(true);
          
          // Fetch both API logs and package info in parallel
          const [logsResult, packageResult] = await Promise.all([
            getApiLogsByActivationKey(activationKey),
            getProjectPackageInfo(activationKey)
          ]);
          
          // Handle API logs
          if (logsResult.success) {
            const logs = logsResult.apiLogs || [];
            setApiLogs(logs);
            
            // Prepare chart data - aggregate CPU usage over last 7 days
            if (logs.length > 0) {
              // Filter logs for the last 7 days
              const sevenDaysAgo = new Date();
              sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
              
              const recentLogs = logs.filter(log => {
                if (!log.created_at) return false;
                const logDate = new Date(log.created_at);
                return logDate >= sevenDaysAgo;
              });
              
              // Aggregate CPU and RAM data by day
              const dailyCpuData: { [key: string]: { total: number; count: number } } = {};
              const dailyRamData: { [key: string]: { total: number; count: number } } = {};
              
              recentLogs.forEach(log => {
                if (log.created_at) {
                  const date = new Date(log.created_at);
                  const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD format
                  
                  // CPU data aggregation
                  if (!dailyCpuData[dateKey]) {
                    dailyCpuData[dateKey] = {
                      total: 0,
                      count: 0
                    };
                  }
                  
                  dailyCpuData[dateKey].total += log.cpu_status;
                  dailyCpuData[dateKey].count += 1;
                  
                  // RAM data aggregation
                  if (!dailyRamData[dateKey]) {
                    dailyRamData[dateKey] = {
                      total: 0,
                      count: 0
                    };
                  }
                  
                  dailyRamData[dateKey].total += log.ram_status;
                  dailyRamData[dateKey].count += 1;
                }
              });
              
              // Convert to chart data points - show average values per day
              const cpuPoints = Object.keys(dailyCpuData)
                .map(date => ({
                  timestamp: date,
                  value: Math.round(dailyCpuData[date].total / dailyCpuData[date].count) // Average CPU usage
                }))
                .sort((a, b) => a.timestamp.localeCompare(b.timestamp)); // Sort by date
              
              const ramPoints = Object.keys(dailyRamData)
                .map(date => ({
                  timestamp: date,
                  value: Math.round(dailyRamData[date].total / dailyRamData[date].count) // Average RAM usage
                }))
                .sort((a, b) => a.timestamp.localeCompare(b.timestamp)); // Sort by date
              
              // For other stats, use the most recent values
              if (recentLogs.length > 0) {
                const latestLog = recentLogs[0]; // Most recent log
                
                const logPoints = [{
                  timestamp: latestLog.created_at ? new Date(latestLog.created_at).toLocaleDateString() : 'Latest',
                  value: latestLog.log_count
                }];
                
                const devicePoints = [{
                  timestamp: latestLog.created_at ? new Date(latestLog.created_at).toLocaleDateString() : 'Latest',
                  value: latestLog.device_count
                }];
                
                setCpuData(cpuPoints);
                setRamData(ramPoints);
                setLogData(logPoints);
                setDeviceData(devicePoints);
              } else {
                // Clear data if no recent logs
                setCpuData([]);
                setRamData([]);
                setLogData([]);
                setDeviceData([]);
              }
            } else {
              // Clear data if no logs at all
              setCpuData([]);
              setRamData([]);
              setLogData([]);
              setDeviceData([]);
            }
          } else {
            console.error('Failed to fetch API logs:', logsResult.error);
          }
          
          // Handle package info
          if (packageResult.success) {
            setPackageInfo(packageResult.packageInfo);
          } else {
            console.error('Failed to fetch package info:', packageResult.error);
          }
        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchApiLogs();
    }
  }, [open, activationKey]);

  // Define columns for the detailed logs table
  const logColumns: ColumnDef<ApiLog, unknown>[] = [
    {
      accessorKey: "created_at",
      header: "Timestamp",
      cell: ({ row }: CellContext<ApiLog, unknown>) => (
        <span>
          {row.original.created_at ? new Date(row.original.created_at).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: "cpu_status",
      header: "CPU %",
      cell: ({ row }: CellContext<ApiLog, unknown>) => (
        <span className={row.original.cpu_status > 80 ? "text-red-500" : row.original.cpu_status > 60 ? "text-yellow-500" : "text-green-500"}>
          {row.original.cpu_status}%
        </span>
      ),
    },
    {
      accessorKey: "ram_status",
      header: "RAM %",
      cell: ({ row }: CellContext<ApiLog, unknown>) => (
        <span className={row.original.ram_status > 80 ? "text-red-500" : row.original.ram_status > 60 ? "text-yellow-500" : "text-green-500"}>
          {row.original.ram_status}%
        </span>
      ),
    },
    {
      accessorKey: "log_count",
      header: "Log Count",
    },
    {
      accessorKey: "device_count",
      header: "Device Count",
    },
    {
      accessorKey: "last_login_date",
      header: "Last Login",
      cell: ({ row }: CellContext<ApiLog, unknown>) => (
        <span>
          {row.original.last_login_date ? new Date(row.original.last_login_date).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
    },
  ];



  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-full max-h-full h-screen w-screen overflow-hidden p-0 sm:max-w-full md:max-w-full lg:max-w-full xl:max-w-full 2xl:max-w-full [&>div]:overflow-y-auto [&>div]:max-h-full" style={{ maxHeight: '100vh' }}>
          <div className="p-6 border-b">
            <DialogHeader>
              <DialogTitle>Advanced View - {activationKey}</DialogTitle>
              <DialogDescription>
                Loading data...
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <ApiLogsAdvancedDialog
      open={open}
      onOpenChange={onOpenChange}
      activationKey={activationKey}
      cpuData={cpuData}
      ramData={ramData}
      logData={logData}
      deviceData={deviceData}
      packageInfo={packageInfo}
      apiLogs={apiLogs}
      logColumns={logColumns}
    />
  );
}