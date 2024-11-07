import type { NextRequest } from 'next/server';

import { logError, logInfo, logWarn } from '@/utils/logger';

/**
 * Class Method Decorator for API Route Logging.
 */
export function LogAPIRoute(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
        const req = args[0] as NextRequest;
        try {
            let params: any = req.nextUrl.searchParams;
            if (req.headers.get('content-type') === 'application/json') {
                params = await req.json();
            }

            logInfo(`${propertyKey} is calling with: ${req.url}, params: ${JSON.stringify(params, null, 2)}, geo: ${JSON.stringify(req.geo, null, 2)}`);

            return await originalMethod.apply(this, args);
        } catch (error) {
            logError(`[${new Date().toISOString()}] Error:`, error);
            throw error;
        }
    };
    return descriptor;
}

/**
 * Class Method Decorator for checking user login status.
 */
export function CheckLogin(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
        const req = args[0] as NextRequest;
        try {
            const accessToken = req.cookies.get('access-token');
            const clientSecret = req.headers.get('client-secret');

            if (!accessToken || !clientSecret) {
                logWarn('login check failed: access-token or client-secret was invalid');
                return { code: 1, message: 'Unauthorized request' };
            }

            return await originalMethod.apply(this, args);
        } catch (error) {
            logError(`[${new Date().toISOString()}] Error:`, error);
            throw error;
        }
    };
    return descriptor;
}
