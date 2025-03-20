import { useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import DataTablePagination from "./DataTablePagination";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table.tsx";
import DataTableToolbar from "@/components/DataTableToolbar.tsx";
import DataTableBody from "@/components/DataTableBody.tsx";
import { FhirResource } from "fhir/r4";

interface DataTableProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  isLoading: boolean;
  selectedData: FhirResource | null;
  onClearSelectedData?: () => void;
  filter?: string;
}

function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const { data, columns, isLoading, selectedData, onClearSelectedData, filter } = props;

  const [globalFilter, setGlobalFilter] = useState(filter ?? '');

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
    },
    enableRowSelection: true,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-2 pt-2">
      <DataTableToolbar
        table={table}
        selectedData={selectedData}
        onClearSelectedData={onClearSelectedData}
      />
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            <DataTableBody
              table={table}
              columns={columns}
              isLoading={isLoading}
              selectedData={selectedData}
            />
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}

export default DataTable;
