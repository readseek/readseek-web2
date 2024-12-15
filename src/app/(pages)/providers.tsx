'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 10, // 10 minutes
                        gcTime: 1000 * 60 * 15,
                        refetchInterval: 1000 * 60 * 5,
                        refetchIntervalInBackground: true,
                        refetchOnReconnect: true,
                        networkMode: 'online',
                        retry: 5,
                        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 1000 * 60),
                    },
                },
            }),
    );

    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />}
        </QueryClientProvider>
    );
}
