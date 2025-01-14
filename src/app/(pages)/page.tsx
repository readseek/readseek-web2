import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { PostCards, getPosts } from '@/components/home/PostCards';

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
        queryFn: getPosts,
    });
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PostCards />
        </HydrationBoundary>
    );
}
