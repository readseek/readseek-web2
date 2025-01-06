import { dehydrate, HydrationBoundary, QueryClient } from '@tanstack/react-query';

import { PostItem, getPosts } from '@/components/home/PostItem';

export default async function HomePage() {
    const queryClient = new QueryClient();
    await queryClient.prefetchQuery({
        queryKey: ['fileList'],
        queryFn: getPosts,
    });
    return (
        <HydrationBoundary state={dehydrate(queryClient)}>
            <PostItem />
        </HydrationBoundary>
    );
}
