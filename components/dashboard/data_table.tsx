"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ChevronDownIcon, SearchIcon } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  onEdit?: (item: TData) => void
  onAdd?: () => void
  onDelete?: (item: TData) => void
  onAdvancedView?: (item: TData) => void
  tableName?: string // Name for display purposes
}

export function DataTable<TData, TValue>({
  columns,
  data,
  onEdit,
  onAdd,
  onDelete,
  onAdvancedView,
  tableName = "items",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [searchValue, setSearchValue] = React.useState("")
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [contextMenu, setContextMenu] = React.useState<{ 
    x: number; 
    y: number; 
    row: {
      original: TData;
    } | null 
  } | null>(null)

  // Filter data based on search value across all columns
  const filteredData = React.useMemo(() => {
    if (!searchValue) return data;
    
    return data.filter((row) => {
      // Check all columns for the search value
      return Object.values(row as Record<string, unknown>).some((value: unknown) => {
        if (value === null || value === undefined) return false;
        
        // Handle nested objects
        if (typeof value === 'object') {
          // Recursively check nested object properties
          return Object.values(value as Record<string, unknown>).some((nestedValue: unknown) => {
            if (nestedValue === null || nestedValue === undefined) return false;
            return nestedValue.toString().toLowerCase().includes(searchValue.toLowerCase());
          });
        }
        
        // Handle primitive values
        return value.toString().toLowerCase().includes(searchValue.toLowerCase());
      });
    });
  }, [data, searchValue]);

  const table = useReactTable({
    data: filteredData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  })

  const handleContextMenu = React.useCallback((e: React.MouseEvent, row: {
    original: TData;
  }) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, row })
  }, [])

  const handleMenuClose = React.useCallback(() => {
    setContextMenu(null)
  }, [])

  const handleEdit = React.useCallback((item: {
    original: TData;
  }) => {
    if (onEdit) {
      onEdit(item.original)
    }
    handleMenuClose()
  }, [onEdit, handleMenuClose])

  const handleDelete = React.useCallback((item: {
    original: TData;
  }) => {
    if (onDelete) {
      onDelete(item.original)
    }
    handleMenuClose()
  }, [onDelete, handleMenuClose])

  const handleAdvancedView = React.useCallback((item: {
    original: TData;
  }) => {
    if (onAdvancedView) {
      onAdvancedView(item.original)
    }
    handleMenuClose()
  }, [onAdvancedView, handleMenuClose])

  // Close context menu when clicking elsewhere
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contextMenu) {
        // Don't close if clicking within the context menu
        const contextMenuElement = document.getElementById('data-table-context-menu')
        if (contextMenuElement && contextMenuElement.contains(e.target as Node)) {
          return
        }
        handleMenuClose()
      }
    }

    document.addEventListener("mousedown", handleClick)
    return () => {
      document.removeEventListener("mousedown", handleClick)
    }
  }, [contextMenu, handleMenuClose])

  return (
    <div className="w-full">
      <div className="flex items-center justify-between py-4">
        <div className="relative w-full max-w-sm">
          <SearchIcon className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${tableName}...`}
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          {onAdd && (
            <Button onClick={onAdd}>
              Add {tableName}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Columns <ChevronDownIcon className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) => column.toggleVisibility(!!value)}
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onContextMenu={(e) => handleContextMenu(e, row)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Context Menu Portal */}
      {contextMenu && (
        <div 
          id="data-table-context-menu"
          className="fixed z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md"
          style={{ 
            left: contextMenu.x, 
            top: contextMenu.y 
          }}
        >
          <div className="px-2 py-1.5 text-sm font-medium">Actions</div>
          <div className="bg-border -mx-1 my-1 h-px"></div>
          {(onEdit || onAdd) && (
            <button
              className="focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden w-full text-left"
              onClick={() => contextMenu?.row && handleEdit(contextMenu.row)}
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              className="focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden w-full text-left"
              onClick={() => contextMenu?.row && handleDelete(contextMenu.row)}
            >
              Delete
            </button>
          )}
          {onAdvancedView && (
            <button
              className="focus:bg-accent focus:text-accent-foreground relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-hidden w-full text-left"
              onClick={() => contextMenu?.row && handleAdvancedView(contextMenu.row)}
            >
              Statics
            </button>
          )}
        </div>
      )}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}