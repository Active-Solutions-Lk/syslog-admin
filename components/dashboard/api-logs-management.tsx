"use client";

import { DataTable } from "@/components/dashboard/data_table";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { useState, useEffect, useCallback } from "react";
import { getApiLogs } from "@/app/actions/api-logs";
import { CellContext } from "@tanstack/react-table";
import { ApiLogsAdvancedView } from "@/components/dashboard/api-logs-advanced-view";
import { RefreshCw } from "lucide-react";

// Define types
interface ApiLogFromServer {
  id: string;
  project_id: string;
  cpu_status: number;
  ram_status: number;
  log_count: number;
  device_count: number;
  last_login_date?: Date | string;
  description?: string;
  created_at?: string | null;
  updated_at?: string | null;
  project?: {
    activation_key: string;
  };
}

interface ApiLog {
  id: string;
  project_id: string;
  cpu_status: number;
  ram_status: number;
  log_count: number;
  device_count: number;
  last_login_date?: Date | string;
  description?: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  project?: {
    activation_key: string;
  };
}

// Helper function to convert ApiLogFromServer to ApiLog
const convertToApiLog = (apiLogFromServer: ApiLogFromServer): ApiLog => {
  return {
    ...apiLogFromServer,
    created_at: apiLogFromServer.created_at || undefined,
    updated_at: apiLogFromServer.updated_at || undefined,
  };
};

// Define columns for the data table
const columns = [
  {
    accessorKey: "project.activation_key",
    header: "Project",
    cell: ({ row }: CellContext<ApiLog, unknown>) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${row.original.project?.activation_key || 'P'}`}/>
          <AvatarFallback>{row.original.project?.activation_key?.charAt(0) || 'P'}</AvatarFallback>
        </Avatar>
        <span>{row.original.project?.activation_key || 'N/A'}</span>
      </div>
    ),
  },
  {
    accessorKey: "cpu_status",
    header: "CPU Status",
    cell: ({ row }: CellContext<ApiLog, unknown>) => (
      <span className={row.original.cpu_status > 80 ? "text-red-500" : row.original.cpu_status > 60 ? "text-yellow-500" : "text-green-500"}>
        {row.original.cpu_status}%
      </span>
    ),
  },
  {
    accessorKey: "ram_status",
    header: "RAM Status",
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
    accessorKey: "created_at",
    header: "Created At",
    cell: ({ row }: CellContext<ApiLog, unknown>) => {
      const created = row.original.created_at ? new Date(row.original.created_at) : null;
      return (
        <span>
          {created ? (
            <time dateTime={created.toISOString()}>
              {created.toLocaleString('en-GB', {
                timeZone: 'Asia/Colombo',
                year: 'numeric',
                month: 'short',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })}
            </time>
          ) : 'N/A'}
        </span>
      )
    },
  },
  
//   {
//     accessorKey: "description",
//     header: "Description",
//   },
];

export function ApiLogsManagement() {
  const [apiLogs, setApiLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdvancedViewOpen, setIsAdvancedViewOpen] = useState(false);
  const [selectedActivationKey, setSelectedActivationKey] = useState<string>('');

  // Fetch API logs from server (supports manual refresh)
  const [refreshing, setRefreshing] = useState(false);

  const fetchApiLogs = useCallback(async (isRefresh = false) => {
    if (isRefresh && refreshing) return;

    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const result = await getApiLogs();
      if (result.success) {
        const apiLogsWithData = (result.apiLogs || []).map(convertToApiLog);

        // Debug: log raw timestamps and conversions to verify timezone handling
        try {
          console.log('apiLogs sample timestamps:', apiLogsWithData.slice(0, 3).map(l => ({
            created_at_raw: l.created_at,
            asDate: l.created_at ? new Date(l.created_at) : null,
            toISOString: l.created_at ? new Date(l.created_at).toISOString() : null,
            utc: l.created_at ? new Date(l.created_at).toLocaleString('en-GB', { timeZone: 'UTC', hour12: false }) : null,
            colombo: l.created_at ? new Date(l.created_at).toLocaleString('en-GB', { timeZone: 'Asia/Colombo', hour12: false }) : null,
          })));
        } catch (err) {
          console.warn('Error logging timestamps', err);
        }

        setApiLogs(apiLogsWithData);
      } else {
        console.error('Failed to fetch API logs:', result.error);
      }
    } catch (error) {
      console.error('Error fetching API logs:', error);
    } finally {
      if (isRefresh) setRefreshing(false);
      else setLoading(false);
    }
  }, [refreshing]); // Omitting convertToApiLog and getApiLogs as they don't change

  useEffect(() => {
    fetchApiLogs(false);
  }, [fetchApiLogs]);

  const handleAdvancedView = (apiLog: ApiLog) => {
    if (apiLog.project?.activation_key) {
      setSelectedActivationKey(apiLog.project.activation_key);
      setIsAdvancedViewOpen(true);
    }
  };

  if (loading) {
    return <div>Loading API logs...</div>;
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">API Logs</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => fetchApiLogs(true)}
            className="px-4 py-2 bg-black text-white rounded hover:bg-gray-600 disabled:opacity-50 flex items-center"
            disabled={refreshing || loading}
          >
            <RefreshCw className={`inline-block mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border-0">
        <DataTable 
          columns={columns} 
          data={apiLogs} 
          onAdvancedView={handleAdvancedView}
          tableName="api-logs"
        />
      </div>
      
      <ApiLogsAdvancedView 
        open={isAdvancedViewOpen}
        onOpenChange={setIsAdvancedViewOpen}
        activationKey={selectedActivationKey}
      />
    </>
  );
}