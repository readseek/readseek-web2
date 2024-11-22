'use client';

import type { Document } from '@/types';

import { ColumnDef, ColumnFiltersState, SortingState, VisibilityState, flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { doGet } from '@/utils/http';

const metadata = {
    title: '文库中心 - 搜读',
};

export const columns: ColumnDef<Document>[] = [
    {
        id: 'select',
        header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')} onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)} aria-label="全选" />,
        cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={value => row.toggleSelected(!!value)} aria-label="选择一列" />,
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'title',
        header: '名称',
        cell: ({ row }) => <div className="capitalize">{row.getValue('title')}</div>,
    },
    {
        accessorKey: 'state',
        header: '状态',
        cell: ({ row }) => <div className="capitalize">{row.getValue('state')}</div>,
    },
    {
        accessorKey: 'authors',
        header: '原作者',
        cell: ({ row }) => <div className="capitalize">{(row.getValue('authors') as string[])?.join(', ')}</div>,
    },
    {
        accessorKey: 'keywords',
        header: '关键词',
        cell: ({ row }) => <div className="capitalize">{(row.getValue('keywords') as string[])?.join(', ')}</div>,
    },
    {
        accessorKey: 'viewCount',
        header: '访问量',
        cell: ({ row }) => <div className="lowercase">{row.getValue('viewCount')}</div>,
    },
    {
        accessorKey: 'updatedAt',
        header: '更新时间',
        cell: ({ row }) => <div className="capitalize">{new Date(row.getValue('updatedAt')).toLocaleString()}</div>,
    },
];

export default function FileListPage() {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const pageSize = 10;
    const [data, setData] = useState<Document[]>([]);
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);

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

    const fetchData = useCallback(async () => {
        const data: any = await doGet(`/api/web/userFiles?page=${page}&size=${pageSize}`);
        console.log('fetchedData: ', data);
        if (data && Array.isArray(data.list)) {
            setData(data.list);
        }
    }, [page]);

    useEffect(() => {
        document.title = metadata.title;
        fetchData();
    }, [fetchData]);

    function previousPage() {
        setPage(page - 1);
        table.previousPage();
    }

    function nextPage() {
        setPage(page + 1);
        table.nextPage();
    }

    return (
        <main className="container flex flex-col">
            <div className="flex items-center py-4">
                <Input placeholder="根据书名筛选信息" value={(table.getColumn('title')?.getFilterValue() as string) ?? ''} onChange={event => table.getColumn('title')?.setFilterValue(event.target.value)} className="max-w-sm" />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            字段 <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter(column => column.getCanHide())
                            .map(column => {
                                return (
                                    <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={column.getIsVisible()} onCheckedChange={value => column.toggleVisibility(!!value)}>
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
                        {table.getHeaderGroups().map(headerGroup => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map(header => {
                                    return <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>;
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map(row => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map(cell => (
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
                    <Button variant="outline" size="sm" onClick={() => previousPage()} disabled={page === 1}>
                        上一页
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => nextPage()} disabled={data.length < pageSize}>
                        下一页
                    </Button>
                </div>
            </div>
        </main>
    );
}
