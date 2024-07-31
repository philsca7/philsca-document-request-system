"use client"

import {
    ColumnDef,
    ColumnFiltersState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
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
import { Dispatch, SetStateAction } from "react"
import React from "react"
import { useTheme } from "next-themes"
import { DataTablePagination } from "./pagination"


interface DataTableProps<TData, TValue> {
    globalFilter: string
    setGlobalFilter: Dispatch<SetStateAction<string>>
    columnVisibility: VisibilityState
    setColumnVisibility: Dispatch<SetStateAction<VisibilityState>>
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    table: any
}

export function DataTable<TData, TValue>({
    globalFilter,
    setGlobalFilter,
    columnVisibility,
    setColumnVisibility,
    columns,
    data,
    table
}: DataTableProps<TData, TValue>) {

    const { theme } = useTheme();

    return (
        <div>
            <div className={`rounded-md border ${theme === 'dark' ? ' bg-[#172030]' : 'bg-[#F4F4F4]'}`}>
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup: any) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header: any) => {
                                    return (
                                        <TableHead className={`text-sm text-gray-500`} key={header.id}>
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
                            table.getRowModel().rows.map((row: any) => (
                                <TableRow
                                    className="text-xs"
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                >
                                    {row.getVisibleCells().map((cell: any) => (
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
            <div className="flex items-center justify-end space-x-2 py-4">
                <DataTablePagination table={table} />
            </div>
        </div>
    )
}
