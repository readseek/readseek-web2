'use client';

import type { Document } from '@/types';

import { ColumnDef } from '@tanstack/react-table';

import { Checkbox } from '@/components/ui/checkbox';

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
