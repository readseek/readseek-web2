'use client';

import { isServer, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
    if (isServer) {
        // Server: always make a new query client
        return new QueryClient({
            defaultOptions: {
                queries: {
                    staleTime: 60 * 1000 * 10,
                    gcTime: 1000 * 60 * 60,
                },
            },
        });
    } else {
        // Browser: make a new query client if we don't already have one
        // This is very important, so we don't re-make a new client if React
        // suspends during the initial render. This may not be needed if we
        // have a suspense boundary BELOW the creation of the query client
        if (!browserQueryClient)
            browserQueryClient = new QueryClient({
                defaultOptions: {
                    queries: {
                        networkMode: 'online',
                        staleTime: 1000 * 60 * 10, // 10 minutes
                        gcTime: 1000 * 60 * 30,
                        refetchOnMount: true,
                        refetchOnReconnect: true,
                        refetchOnWindowFocus: true,
                        refetchInterval: 1000 * 60 * 15,
                        refetchIntervalInBackground: true,
                        retry: 5,
                        retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 1000 * 60),
                    },
                },
            });
        return browserQueryClient;
    }
}

export default function QueryProvider({ children }: { children: React.ReactNode }) {
    // https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
    const queryClient = getQueryClient();
    return (
        <QueryClientProvider client={queryClient}>
            {children}
            {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-left" />}
        </QueryClientProvider>
    );
}
