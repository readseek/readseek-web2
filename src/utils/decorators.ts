import type { NextRequest, NextResponse } from 'next/server';

/**
 * Class Method Decorator for API Route Logging
 */
export function LogAPIRoute() {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const [req, res] = args;
            console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
            try {
                const result = await originalMethod.apply(this, args);
                console.log(`[${new Date().toISOString()}] Response Status: ${res.statusCode}`);
                return result;
            } catch (error) {
                console.error(`[${new Date().toISOString()}] Error:`, error);
                throw error;
            }
        };

        return descriptor;
    };
}

export function needLogin(func: Function) {
    return function (...args: any[]) {
        console.log('在函数执行前的一些额外操作');

        // const cookies = req.cookies;
        // const headers = req.headers;
        // systemLog(0, cookies, headers);
        // req.headers.set('userId', '1');

        // @ts-ignore
        const result = func.apply(this, args);
        console.log('在函数执行后的一些额外操作');
        return result;
    };
}
