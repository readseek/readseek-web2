'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { isDevModel } from '@/utils/common';

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
    // Browser: make a new query client if we don't already have one
    // This is very important, so we don't re-make a new client if React
    // suspends during the initial render. This may not be needed if we
    // have a suspense boundary BELOW the creation of the query client
    if (!browserQueryClient) {
        let optQueries = {
            retry: 5,
            staleTime: 1000 * 60 * 10, // 10 minutes
            gcTime: 1000 * 60 * 30,
            refetchIntervalInBackground: true,
        };
        if (isDevModel()) {
            optQueries = Object.assign(
                {
                    refetchOnMount: 'always',
                    refetchOnReconnect: 'always',
                    refetchOnWindowFocus: 'always',
                    throwOnError: true,
                    experimental_prefetchInRender: true,
                },
                optQueries,
            );
        }
        browserQueryClient = new QueryClient({
            defaultOptions: {
                queries: optQueries,
            },
        });
    }
    return browserQueryClient;
}

export default function QueryProvider({ children }) {
    return (
        <QueryClientProvider client={getQueryClient()}>
            {children}
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />}
        </QueryClientProvider>
    );
}
