import type { NextRequest } from 'next/server';

import { logError, logInfo, logWarn } from '@/utils/logger';

/**
 * Class Method Decorator for API Route Logging
 */
export function LogAPIRoute(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
        const req = args[0] as NextRequest;
        try {
            logInfo(`${propertyKey} calling with: ${req.url}, region: ${req.geo?.region}`);
            const result: APIRet = await originalMethod.apply(this, args);

            if (result && result.code !== 0) {
                logWarn(`Response result warning: ${result.code} --- ${result.message}`);
            }

            return result;
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Error:`, error);
            throw error;
        }
    };
    return descriptor;
}

export function needLogin(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;
    descriptor.value = async function (...args: any[]) {
        const req = args[0] as NextRequest;
        try {
            // const cookies = req.cookies;
            // const headers = req.headers;
            // req.headers.set('userId', '1');

            const result: APIRet = await originalMethod.apply(this, args);

            if (result && result.code !== 0) {
                logWarn(`Response result warning: ${result.code} --- ${result.message}`);
            }

            return result;
        } catch (error) {
            console.error(`[${new Date().toISOString()}] Error:`, error);
            throw error;
        }
    };
    return descriptor;
}
