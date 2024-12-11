'use client';

import type { Document } from '@/types';

import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

export const columns: ColumnDef<Document>[] = [
    {
        id: 'select',
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')} onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)} aria-label="全选" />,
        cell: ({ row }) => <Checkbox checked={row.getIsSelected()} onCheckedChange={value => row.toggleSelected(!!value)} aria-label="选择一列" />,
    },
    {
        accessorKey: 'title',
        header: '名称',
        enableSorting: false,
        enableHiding: true,
        cell: ({ row }) => <div className="text-balance">{row.getValue('title')}</div>,
    },
    {
        accessorKey: 'keywords',
        header: '关键词',
        enableSorting: false,
        enableHiding: true,
        cell: ({ row }) => <div className="w-64 text-balance">{(row.getValue('keywords') as string[])?.join(', ')}</div>,
    },
    {
        accessorKey: 'authors',
        header: '原作者',
        enableSorting: false,
        enableHiding: true,
        cell: ({ row }) => <div className="w-28 text-balance">{(row.getValue('authors') as string[])?.join(', ')}</div>,
    },
    {
        accessorKey: 'state',
        header: '状态',
        enableSorting: false,
        enableHiding: true,
        cell: ({ row }) => <div className="w-24 text-balance">{row.getValue('state')}</div>,
    },
    {
        accessorKey: 'viewCount',
        header: '访问量',
        enableSorting: true,
        enableHiding: true,
        cell: ({ row }) => <div className="w-16 text-nowrap">{row.getValue('viewCount')}</div>,
    },
    {
        accessorKey: 'updatedAt',
        header: '更新时间',
        enableSorting: true,
        enableHiding: true,
        cell: ({ row }) => <div className="w-36 text-balance">{new Date(row.getValue('updatedAt')).toLocaleString()}</div>,
    },
    {
        id: 'actions',
        cell: ({ row }) => {
            const doc = row.original;
            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => navigator.clipboard.writeText(doc.title)}>复制名称</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">删除该项</DropdownMenuItem>
                        <DropdownMenuItem className="text-green-600">开启对话</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        },
    },
];
