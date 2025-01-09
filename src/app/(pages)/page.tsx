import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { PostCards, getPosts } from '@/components/home/PostCards';

export default async function HomePage() {
    const queryClient = new QueryClient();
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
