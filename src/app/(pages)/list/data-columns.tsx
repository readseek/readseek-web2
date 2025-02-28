'use client';

import type { Document } from '@/models/Document';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export const tableColumns: ColumnDef<Document>[] = [
    {
        id: 'select',
        enableSorting: false,
        enableHiding: false,
        header: ({ table }) => (
            <Checkbox checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')} onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)} aria-label="全选" />
        ),
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
        enableSorting: true,
        enableHiding: true,
        cell: ({ row }) => <div className="w-16 text-nowrap">{row.getValue('viewCount')}</div>,
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {'访问量'}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'updatedAt',
        enableSorting: true,
        enableHiding: true,
        cell: ({ row }) => <div className="w-36 text-balance">{new Date(row.getValue('updatedAt')).toLocaleString()}</div>,
        header: ({ column }) => {
            return (
                <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
                    {'更新时间'}
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        id: 'actions',
    },
];
