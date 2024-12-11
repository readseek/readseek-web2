'use client';

import type { Document } from '@/types';

import { useEffect, useState, useCallback } from 'react';

import { getData } from '@/utils/http/client';

import { columns } from './columns';
import { DataTable } from './data-table';

const metadata = {
    title: '文库中心 - 搜读',
};

export default function FileListPage() {
    const pageSize = 10;

    const [data, setData] = useState<Document[]>([]);
    const [page, setPage] = useState<number>(1);

    const fetchData = useCallback(async () => {
        const data: any = await getData(`/api/web/userFiles?page=${page}&size=${pageSize}`);
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
        // table.previousPage();
    }

    function nextPage() {
        setPage(page + 1);
        // table.nextPage();
    }

    return (
        <div className="container flex flex-col">
            <DataTable columns={columns} data={data} />
        </div>
    );
}
