'use client';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';

const metadata = {
    title: '文库中心 - 如何看待',
};

type Payment = {
    id: string;
    name: string;
    author: string;
    amount: number;
    status: 'pending' | 'processing' | 'success' | 'failed';
};

const data: Payment[] = [
    {
        id: 'm5gr84i9',
        name: 'HTTP权威指南',
        author: 'jack@ruhekandai.com',
        amount: 88,
        status: 'success',
    },
    {
        id: '3u1reuv4',
        name: 'TypeScript进阶',
        author: 'thomas@ruhekandai.com',
        amount: 58,
        status: 'success',
    },
    {
        id: 'derv1ws0',
        name: '低欲望社会',
        author: 'pony@ruhekandai.com',
        amount: 43,
        status: 'pending',
    },
    {
        id: '5kma53ae',
        name: '聪明的投资',
        author: 'tony@ruhekandai.com',
        amount: 72,
        status: 'processing',
    },
    {
        id: 'bhqecj4p',
        name: '看见',
        author: 'lucy@ruhekandai.com',
        amount: 50,
        status: 'failed',
    },
];

export const columns: ColumnDef<Payment>[] = [
    {
        id: 'select',
        header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')} onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} aria-label="全选" />,
        cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={(value) => row.toggleSelected(!!value)} aria-label="选择一列" />,
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: '书名',
        cell: ({ row }) => <div className="capitalize">{row.getValue('name')}</div>,
    },
    {
        accessorKey: 'author',
        header: '作者',
        cell: ({ row }) => <div className="lowercase">{row.getValue('author')}</div>,
    },
    {
        accessorKey: 'amount',
        header: ({ column }) => {
            return (
                <Button variant="ghost" className="px-0" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    价格
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue('amount'));
            // Format the amount as a dollar amount
            const formatted = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
            }).format(amount);
            return <div className="font-medium capitalize">{formatted}</div>;
        },
    },
    {
        accessorKey: 'status',
        header: '转录状态',
        cell: ({ row }) => <div className="capitalize">{row.getValue('status')}</div>,
    },
];

export default function FileListPage() {
    useEffect(() => {
        document.title = metadata.title;
    }, []);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const table = useReactTable({
        data,
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
    });
    return (
        <main className="container flex flex-col">
            <div className="flex items-center py-4">
                <Input placeholder="根据书名筛选信息" value={(table.getColumn('name')?.getFilterValue() as string) ?? ''} onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)} className="max-w-sm" />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            字段 <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>;
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    没有找到数据.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredSelectedRowModel().rows.length} of {table.getFilteredRowModel().rows.length} row(s) selected.
                </div>
                <div className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                        Previous
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                        Next
                    </Button>
                </div>
            </div>
        </main>
    );
}
