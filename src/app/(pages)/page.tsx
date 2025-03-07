import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { PostCards } from '@/components/home/PostCards';
import { GET_URI } from '@/utils/http';
import { getServerData } from '@/utils/http/server';

async function getServerPosts() {
    const ret: any = await getServerData(GET_URI.fileList);
    if (!Array.isArray(ret?.data.list) || !ret.data.list.length) {
        return { total: 0, posts: [] };
    }
    return { total: ret.data.total, posts: ret.data.list };
}

// https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
export default async function HomePage(props) {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 30,
                gcTime: 1000 * 60 * 60,
            },
        },
    });
    await queryClient.prefetchQuery({
        queryKey: ['fileList'],
        queryFn: getServerPosts,
    });
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PostCards />
        </HydrationBoundary>
    );
}
